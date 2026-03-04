'use client';

import { useState } from 'react';
import CommentForm from '@/components/CommentForm';
import ModerationResult from '@/components/ModerationResult';
import ApprovedComments from '@/components/ApprovedComments';

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

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ModerationResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleResult = (res: ModerationResponse) => {
    setResult(res);
    // Trigger approved comments refetch when a new comment is approved
    if (res.classification === 'SAFE') {
      setRefreshKey((k) => k + 1);
    }
    // Scroll result into view smoothly
    setTimeout(() => document.getElementById('moderation-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-white/60 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Content Moderation</h1>
            <p className="text-xs text-gray-500">Powered by InsForge · openai/gpt-4o-mini</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Intro */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Submit a Comment</h2>
          <p className="text-sm text-gray-500">
            Your comment will be reviewed by AI before being stored. Safe content is approved instantly.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <CommentForm onResult={handleResult} onLoading={setIsLoading} isLoading={isLoading} />
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-36 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-3 w-3/4 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
          </div>
        )}

        {/* Moderation result */}
        {!isLoading && result && (
          <div id="moderation-result">
            <ModerationResult
              classification={result.classification}
              message={result.message}
              comment={result.comment}
            />
          </div>
        )}

        {/* Try again hint */}
        {result && !isLoading && (
          <p className="text-center text-xs text-gray-400">
            Submit another comment above to run moderation again.
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Approved comments feed */}
        <ApprovedComments refreshKey={refreshKey} />
      </main>
    </div>
  );
}
