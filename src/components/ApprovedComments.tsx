'use client';

import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';

interface Comment {
  id: string;
  content: string;
  attachment_url: string | null;
  created_at: string;
}

interface ApprovedCommentsProps {
  refreshKey: number;
}

export default function ApprovedComments({ refreshKey }: ApprovedCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await insforge.database
        .from('comments')
        .select('id, content, attachment_url, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (dbError) {
        setError('Failed to load approved comments.');
      } else {
        setComments((data as Comment[]) ?? []);
      }
      setLoading(false);
    };

    fetchComments();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h3 className="text-base font-semibold text-gray-800">Approved Comments</h3>
          {!loading && !error && (
            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          )}
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-5/6 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && comments.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white py-12 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No approved comments yet</p>
          <p className="text-xs text-gray-400">Submit a safe comment above to see it appear here.</p>
        </div>
      )}

      {/* Comment cards */}
      {!loading && !error && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow"
            >
              {/* Meta row */}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <time className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </time>
              </div>

              {/* Comment text */}
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

              {/* Attachment image */}
              {comment.attachment_url && (
                <a href={comment.attachment_url} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={comment.attachment_url}
                    alt="Comment attachment"
                    className="w-full max-h-64 object-cover rounded-xl border border-gray-100 hover:opacity-90 transition-opacity"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

