'use client';

import { useState, FormEvent } from 'react';
import FileUpload from './FileUpload';

interface ModerationResponse {
  classification: 'SAFE' | 'UNSAFE';
  message: string;
  comment: {
    id: string;
    content: string;
    attachment_url: string | null;
    status: string;
    created_at: string;
  } | null;
}

interface CommentFormProps {
  onResult: (result: ModerationResponse) => void;
  onLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const FUNCTION_URL = `${process.env.NEXT_PUBLIC_INSFORGE_BASE_URL}/functions/moderate-comment`;

export default function CommentForm({ onResult, onLoading, isLoading }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Please enter a comment before submitting.');
      return;
    }

    onLoading(true);

    try {
      // Encode file as base64 so we can send a plain JSON body
      // (InsForge edge functions use req.json(); multipart is not supported)
      let filePayload: { name: string; type: string; data: string } | null = null;
      if (file) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        filePayload = {
          name: file.name,
          type: file.type || 'application/octet-stream',
          data: btoa(binary),
        };
      }

      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim(), file: filePayload }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? `Request failed with status ${res.status}`);
      }

      onResult({
        classification: data.moderation?.classification,
        message: data.message,
        comment: data.comment,
      });

      // Reset form on success
      setContent('');
      setFile(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Comment text input */}
      <div className="space-y-1.5">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Comment <span className="text-red-400">*</span>
        </label>
        <textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          rows={5}
          placeholder="Write your comment here..."
          className={[
            'w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'resize-none transition-colors bg-white',
            isLoading ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'border-gray-300',
          ].join(' ')}
        />
        <div className="flex justify-end">
          <span className={['text-xs', content.length > 900 ? 'text-red-400' : 'text-gray-400'].join(' ')}>
            {content.length} / 1000
          </span>
        </div>
      </div>

      {/* File upload */}
      <FileUpload file={file} onChange={setFile} disabled={isLoading} />

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading || !content.trim()}
        className={[
          'w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white',
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isLoading || !content.trim()
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]',
        ].join(' ')}
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Moderating…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Submit for Moderation
          </>
        )}
      </button>
    </form>
  );
}

