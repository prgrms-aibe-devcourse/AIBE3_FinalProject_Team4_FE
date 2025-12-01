'use client';

import { formatRelativeTime } from '@/src/utils/time';
import { Plus, X } from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';

export interface DraftItem {
  id: number;
  content: string;
  thumbnailUrls: string[];
  hashtags: string[];
  createdAt: string;
}

interface DraftManagerModalProps {
  isOpen: boolean;
  drafts: DraftItem[];
  onClose: () => void;
  onLoad: (draftId: number) => void;
  onDelete: (draftId: number) => void;
  isLoading?: boolean;
}

export default function DraftManagerModal({
  isOpen,
  drafts,
  onClose,
  onLoad,
  onDelete,
  isLoading = false,
}: DraftManagerModalProps) {
  if (!isOpen) return null;

  const maxSlots = 5;
  const draftCount = drafts.length;

  // 7일이 지났는지 확인
  const isExpired = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  };

  // 빈 슬롯 렌더링
  const renderEmptySlots = () => {
    const emptyCount = maxSlots - draftCount;
    return Array.from({ length: emptyCount }).map((_, idx) => (
      <div
        key={`empty-${idx}`}
        className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50"
      >
        <Plus className="h-8 w-8 text-slate-300" />
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            임시저장 ({draftCount}/{maxSlots})
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* 그리드 */}
              <div className="grid grid-cols-3 gap-4">
                {drafts.map((draft) => {
                  const expired = isExpired(draft.createdAt);

                  return (
                    <div
                      key={draft.id}
                      className={`
                        group relative overflow-hidden rounded-2xl border-2 transition
                        ${expired ? 'border-slate-200 bg-slate-100 opacity-50' : 'border-slate-200 bg-white'}
                      `}
                    >
                      {/* 썸네일 */}
                      <div className="aspect-square overflow-hidden bg-slate-100">
                        {draft.thumbnailUrls && draft.thumbnailUrls.length > 0 ? (
                          <img
                            src={draft.thumbnailUrls[0]}
                            alt="임시저장 썸네일"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-slate-200">
                            <span className="text-4xl text-slate-400">📝</span>
                          </div>
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="p-3">
                        <p className="line-clamp-2 text-xs text-slate-600">
                          {draft.content || '내용 없음'}
                        </p>
                        <p className={`mt-1.5 text-[10px] ${expired ? 'text-slate-400' : 'text-slate-500'}`}>
                          {formatRelativeTime(draft.createdAt)}
                          {expired && ' (7일 경과)'}
                        </p>
                      </div>

                      {/* 버튼 */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => onLoad(draft.id)}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-slate-100"
                        >
                          불러오기
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(draft.id);
                          }}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 빈 슬롯 */}
                {renderEmptySlots()}
              </div>

              {/* 하단 버튼 */}
              <div className="mt-6 flex items-center justify-center">
                <button
                  onClick={onClose}
                  className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  닫기
                </button>
              </div>

              {/* 안내 문구 */}
              <p className="mt-4 text-center text-xs text-slate-500">
                임시저장은 최대 5개까지 가능하며, 7일이 지나면 회색으로 표시돼요.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

