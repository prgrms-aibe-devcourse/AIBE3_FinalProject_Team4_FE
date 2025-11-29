'use client';

import { X } from 'lucide-react';
import type { BlogDraftDto } from '@/src/types/blog';

type DraftListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  drafts: BlogDraftDto[];
  onSelectDraft: (draft: BlogDraftDto) => void;
  onDeleteDraft: (draftId: number) => void;
  isLoading: boolean;
};

export function DraftListModal({
  isOpen,
  onClose,
  drafts,
  onSelectDraft,
  onDeleteDraft,
  isLoading,
}: DraftListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">임시저장 목록</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">불러오는 중...</div>
        ) : drafts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">임시저장된 글이 없습니다.</div>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto py-2 text-xs">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50"
              >
                <button
                  type="button"
                  className="flex flex-1 flex-col items-start text-left"
                  onClick={() => onSelectDraft(draft)}
                >
                  <span className="line-clamp-1 font-medium text-slate-900">
                    {draft.title || '제목 없음'}
                  </span>
                  <span className="mt-0.5 text-[10px] text-slate-400">
                    {draft.status} · {draft.modifiedAt?.slice(0, 19).replace('T', ' ')}
                  </span>
                  <span className="mt-0.5 text-[10px] text-slate-400">
                    {draft.isPublic ? '공개' : '비공개'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteDraft(draft.id)}
                  className="ml-2 rounded-full px-2 py-1 text-[10px] text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
