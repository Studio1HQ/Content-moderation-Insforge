
import { createClient } from "@insforge/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function (req: Request): Promise<Response> {
  /* ── CORS pre-flight ─────────────────────────────────────────── */
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  /* ── Parse JSON body ─────────────────────────────────────────── */
  let content: string;
  let uploadedFile: File | null = null;

  try {
    const body = await req.json();
    content = (body.content as string) ?? "";

    // Reconstruct file from base64 if provided
    if (body.file && body.file.data) {
      const { name, type, data } = body.file;
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      uploadedFile = new File([bytes], name || "upload", {
        type: type || "application/octet-stream",
      });
    }
  } catch (parseErr) {
    return new Response(
      JSON.stringify({
        error: "Failed to parse request body. Send JSON with a 'content' field.",
        details: String(parseErr),
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!content || content.trim() === "") {
    return new Response(
      JSON.stringify({ error: "'content' is required and must be a non-empty string." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* ── InsForge client ─────────────────────────────────────────── */
  const insforge = createClient({
    baseUrl: (globalThis as any).Deno?.env.get("INSFORGE_BASE_URL") ?? "",
    anonKey: (globalThis as any).Deno?.env.get("ANON_KEY") ?? "",
  });

  /* ── Step 1: AI moderation — classify SAFE / UNSAFE ─────────── */
  const systemPrompt =
    "You are a content moderation system.\n\n" +
    "Classify the following text as SAFE or UNSAFE.\n\n" +
    "UNSAFE includes:\n" +
    "- hate speech\n" +
    "- harassment\n" +
    "- threats\n" +
    "- sexual abuse\n" +
    "- harmful or illegal content\n\n" +
    "Respond with only one word:\n" +
    "SAFE\n" +
    "or\n" +
    "UNSAFE";

  let classification: "SAFE" | "UNSAFE";

  try {
    const completion = await insforge.ai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content.trim() },
      ],
      temperature: 0,
      maxTokens: 10,
    });

    const raw = completion.choices[0]?.message?.content?.trim().toUpperCase() ?? "";
    classification = raw === "SAFE" ? "SAFE" : "UNSAFE";
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "AI moderation failed", details: String(err) }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* ── Step 2: UNSAFE — reject immediately, no DB/storage ops ─── */
  if (classification === "UNSAFE") {
    return new Response(
      JSON.stringify({
        moderation: { classification: "UNSAFE" },
        comment: null,
        message: "Comment rejected. Content was classified as unsafe and has not been stored.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* ── Step 3: SAFE — upload file if present ───────────────────── */
  let attachment_url: string | null = null;

  if (uploadedFile) {
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("attachments")
      .uploadAuto(uploadedFile);

    if (uploadError || !uploadData) {
      return new Response(
        JSON.stringify({ error: "File upload failed", details: uploadError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    attachment_url = uploadData.url;
  }

  /* ── Step 4: SAFE — insert comment into database ─────────────── */
  const { data: inserted, error: dbError } = await insforge.database
    .from("comments")
    .insert([
      {
        content: content.trim(),
        attachment_url,
        status: "approved",
      },
    ])
    .select();

  if (dbError) {
    return new Response(
      JSON.stringify({ error: "Database insert failed", details: dbError.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* ── Step 5: Return success ──────────────────────────────────── */
  return new Response(
    JSON.stringify({
      moderation: { classification: "SAFE" },
      comment: inserted?.[0] ?? null,
      message: "Comment approved and stored successfully.",
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}