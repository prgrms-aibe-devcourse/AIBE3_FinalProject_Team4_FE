'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type BlogWriteHeaderProps = {
  onSaveDraft?: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  onOpenDrafts?: () => void;
};

export function BlogWriteHeader({
  onSaveDraft,
  onPublish,
  isPublishing,
  onOpenDrafts,
}: BlogWriteHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h1 className="text-sm font-semibold text-slate-800">블로그 글 작성</h1>
      </div>
      <div className="flex items-center gap-2">
        {onOpenDrafts && (
          <button
            type="button"
            onClick={onOpenDrafts}
            className="rounded-full bg-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-300"
          >
            임시저장 목록
          </button>
        )}
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            임시저장
          </button>
        )}
        {onPublish && (
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing}
            className="rounded-full bg-[#2979FF] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1f5fd1] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPublishing ? '발행 중...' : '발행하기'}
          </button>
        )}
      </div>
    </header>
  );
}
