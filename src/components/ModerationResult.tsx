'use client';

interface Comment {
  id: string;
  content: string;
  attachment_url: string | null;
  status: string;
  created_at: string;
}

interface ModerationResultProps {
  classification: 'SAFE' | 'UNSAFE';
  message: string;
  comment: Comment | null;
}

export default function ModerationResult({ classification, message, comment }: ModerationResultProps) {
  const isSafe = classification === 'SAFE';

  return (
    <div
      className={[
        'rounded-2xl border p-6 space-y-4 transition-all',
        isSafe
          ? 'border-green-200 bg-green-50'
          : 'border-red-200 bg-red-50',
      ].join(' ')}
    >
      {/* ── Verdict badge ── */}
      <div className="flex items-center gap-3">
        <div
          className={[
            'flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0',
            isSafe ? 'bg-green-100' : 'bg-red-100',
          ].join(' ')}
        >
          {isSafe ? (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div>
          <p className={['text-lg font-bold', isSafe ? 'text-green-800' : 'text-red-800'].join(' ')}>
            {isSafe ? 'Comment Approved' : 'Comment Rejected'}
          </p>
          <span
            className={[
              'inline-block text-xs font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full',
              isSafe ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700',
            ].join(' ')}
          >
            {classification}
          </span>
        </div>
      </div>

      {/* ── Message ── */}
      <p className={['text-sm', isSafe ? 'text-green-700' : 'text-red-700'].join(' ')}>{message}</p>

      {/* ── Stored comment details (SAFE only) ── */}
      {isSafe && comment && (
        <div className="border-t border-green-200 pt-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Stored Comment</p>

          <div className="bg-white rounded-xl border border-green-100 p-4 space-y-2 shadow-sm">
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 w-24 flex-shrink-0 pt-0.5">ID</span>
              <span className="text-xs font-mono text-gray-600 break-all">{comment.id}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 w-24 flex-shrink-0 pt-0.5">Content</span>
              <span className="text-sm text-gray-800">{comment.content}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 w-24 flex-shrink-0 pt-0.5">Status</span>
              <span className="text-xs font-semibold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {comment.status}
              </span>
            </div>
            {comment.attachment_url && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-400 w-24 flex-shrink-0 pt-0.5">Attachment</span>
                <a
                  href={comment.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline break-all"
                >
                  View file ↗
                </a>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 w-24 flex-shrink-0 pt-0.5">Saved at</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

