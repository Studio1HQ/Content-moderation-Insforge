<div align="center">

<img src="https://raw.githubusercontent.com/Studio1HQ/Studio1HQ/main/assets/banners/Content-moderation-Insforge.webp" alt="AI Content Moderation with InsForge: Moderate comments with an LLM before they reach your database" width="100%" />

<br />
<br />

# AI Content Moderation with InsForge

### Moderate comments with an LLM before they reach your database

A Next.js comment form that sends text and optional files to an InsForge edge function. The function classifies the text with a model gateway call and stores safe comments and attachments in InsForge.

<br />

[![Built by Studio1](https://img.shields.io/badge/Built_by_Studio1-f97316?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgMTYwIiBmaWxsPSJub25lIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTAgMzVDMCAxNi42ODA3IDE0LjA3NDQgMS42NDg0NCAzMiAwLjEyNjk1M1YxNDFINTEuMDUyM0M1Mi40MzA4IDEzNy4zNDQgNTQuNzQ0NiAxMzMuNjg5IDU3Ljk5MzggMTMwLjAzM0M2MS4xNDQ2IDEyNi41MDggNjQuNjg5MiAxMjMuNDQgNjguNjI3NyAxMjAuODI5QzcyLjU2NjIgMTE4LjM0OSA3Ni4zNTY5IDExNi43ODIgODAgMTE2LjEyOVY4Ni43NTQ0Qzc1LjQ3MDggODcuOTI5MiA3MS4zODQ2IDg5LjY5MTkgNjcuNzQxNSA5Mi4wNDE1QzY0IDk0LjUyMjUgNjAuNzUwOCA5Ny40NiA1Ny45OTM4IDEwMC44NTRDNTYuNTM0NSAxMDIuNzIgNTUuMjU0NSAxMDQuNjU5IDU0LjE1MzkgMTA2LjY3MVYwSDEyNUMxNDQuMzMgMCAxNjAgMTUuNjY5OSAxNjAgMzVWMTI1QzE2MCAxNDQuMzMgMTQ0LjMzIDE2MCAxMjUgMTYwSDEyNFYxOEgxMDQuOTQ4QzEwMy41NjkgMjEuNjgxNiAxMDEuMjU1IDI1LjM2MjggOTguMDA2MiAyOS4wNDQ0Qzk0Ljg1NTQgMzIuNTk0MiA5MS4zMTA4IDM1LjY4NDEgODcuMzcyMyAzOC4zMTRDODMuNDMzOCA0MC44MTIgNzkuNjQzMSA0Mi4zODk2IDc2IDQzLjA0NzRWNzIuNjMwNEM4MC41MjkyIDcxLjQ0NzMgODQuNjE1NCA2OS42NzI0IDg4LjI1ODUgNjcuMzA1N0M5MiA2NC44MDc2IDk1LjI0OTIgNjEuODQ5MSA5OC4wMDYyIDU4LjQzMDdDOTkuNDY1NSA1Ni41NTEzIDEwMC43NDUgNTQuNTk4NiAxMDEuODQ2IDUyLjU3MjNWMTYwSDM1QzE1LjY3IDE2MCAwIDE0NC4zMyAwIDEyNVYzNVoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4K)](https://studio1hq.com)
[![Built with InsForge](https://img.shields.io/badge/Built_with_InsForge-141414?style=for-the-badge)](https://insforge.dev)

[InsForge docs](https://docs.insforge.dev) &nbsp;·&nbsp; [InsForge](https://insforge.dev) &nbsp;·&nbsp; [More examples](https://github.com/Studio1HQ) &nbsp;·&nbsp; [studio1hq.com](https://studio1hq.com)

</div>

<br />

## Overview

This example shows a moderation pipeline built entirely on [InsForge](https://insforge.dev). A visitor submits a comment, optionally with a file. An InsForge edge function asks a model through the InsForge model gateway whether the text is safe. Unsafe comments are rejected and nothing is stored. Safe comments have their attachment uploaded to InsForge storage and the comment saved in the InsForge database with status `approved`.

The frontend is a small Next.js app that posts to the edge function and lists approved comments.

## Features

- **AI classification**: The edge function calls `openai/gpt-4o-mini` through the InsForge model gateway with temperature 0 and expects one word, `SAFE` or `UNSAFE`. Anything other than `SAFE` is treated as unsafe.
- **Reject before storing**: Unsafe content returns early with no database or storage writes.
- **File attachments**: Files are sent as base64 JSON, rebuilt in the function and uploaded to the `attachments` bucket with `uploadAuto`.
- **Approved comments list**: The UI reads comments with `status = approved` from the `comments` table.
- **Clear result states**: The UI shows the moderation result and message returned by the function.
- **CORS-ready function**: The handler answers preflight requests and accepts only `POST`.

## Tech stack

| Layer | Tool |
| --- | --- |
| Backend platform | [InsForge](https://insforge.dev) (database, storage, model gateway, edge functions) |
| Edge function | Deno runtime with `@insforge/sdk` |
| Model | `openai/gpt-4o-mini` via the InsForge model gateway |
| Frontend | [Next.js](https://nextjs.org/) 15, React 19, TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |

## Getting started

### Prerequisites

- Node.js 18 or later and npm
- An InsForge project, from the [InsForge dashboard](https://insforge.dev)
- A `comments` table with `content`, `attachment_url`, `status` and `created_at` columns (the function also reads `id` back)
- A storage bucket named `attachments`

### Installation

```bash
git clone https://github.com/Studio1HQ/Content-moderation-Insforge.git
cd Content-moderation-Insforge
npm install
cp env.example .env.local
```

### Environment variables

Frontend, in `.env.local`:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_INSFORGE_BASE_URL` | Your InsForge backend URL, for example `https://your-app.region.insforge.app`. |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge anonymous key. Needed for database reads from the browser. |

Edge function secrets, set in your InsForge project:

| Variable | Description |
| --- | --- |
| `INSFORGE_BASE_URL` | Your InsForge backend URL. |
| `ANON_KEY` | InsForge anonymous key used by the function's client. |

### Run

Deploy `insforge-functions/moderate-comment/handler.ts` as an edge function named `moderate-comment` (see the [InsForge docs](https://docs.insforge.dev)), then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## How it works

1. `CommentForm` posts JSON (`content` and an optional base64 `file`) to `<base URL>/functions/moderate-comment`. Multipart uploads are not supported by InsForge edge functions, hence base64.
2. The function validates the body, then calls `insforge.ai.chat.completions.create` with a moderation system prompt that lists hate speech, harassment, threats, sexual abuse and harmful or illegal content as unsafe.
3. On `UNSAFE`, it returns `{ moderation: { classification: "UNSAFE" }, comment: null }`.
4. On `SAFE`, it uploads the file (if any), inserts the comment into `comments` with `status: "approved"` and returns the stored row.
5. `ApprovedComments` refetches the approved list after each approved submission.

```text
insforge-functions/moderate-comment/handler.ts   # Edge function
src/lib/insforge.ts                              # SDK client for the browser
src/components/                                  # CommentForm, FileUpload, ModerationResult, ApprovedComments
src/app/page.tsx                                 # Page
```

## Resources

- [InsForge docs](https://docs.insforge.dev): edge functions, model gateway, database and storage.
- [InsForge](https://insforge.dev): the backend platform used here.
- [Next.js documentation](https://nextjs.org/docs): the frontend framework.

<br />

---

<div align="center">

<a href="https://studio1hq.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-dark.svg" />
    <img src="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-light.svg" alt="Studio1" width="160" />
  </picture>
</a>

Built by **[Studio1](https://studio1hq.com)**, the technical content and DevRel partner for devtool teams. Made with [InsForge](https://insforge.dev).<br />
Browse more open-source examples at [github.com/Studio1HQ](https://github.com/Studio1HQ).

[![Website](https://img.shields.io/badge/studio1hq.com-0b0807?style=for-the-badge&logo=googlechrome&logoColor=white)](https://studio1hq.com)
[![Book a call](https://img.shields.io/badge/Book_a_strategy_call-f97316?style=for-the-badge&logo=googlecalendar&logoColor=white)](https://cal.com/studio1/collab)
[![X](https://img.shields.io/badge/%40Studio1HQ-141414?style=for-the-badge&logo=x&logoColor=white)](https://x.com/Studio1HQ)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/studio1hq/)

<sub><a href="https://studio1hq.com">studio1hq.com</a> · Technical content, docs, video and DevRel for devtools</sub>

</div>
