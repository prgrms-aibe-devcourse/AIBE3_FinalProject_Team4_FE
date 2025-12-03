'use client';

import type { LinkedShorlogSummary } from '@/src/types/blog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LinkedShorlogListModalProps = {
  open: boolean;
  loading: boolean;
  items: LinkedShorlogSummary[];
  onClose: () => void;
  onUnlink: (shorlogId: number) => Promise<void> | void;
};
export function LinkedShorlogListModal({
  open,
  loading,
  items,
  onClose,
  onUnlink,
}: LinkedShorlogListModalProps) {
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);
  const router = useRouter();
  if (!open) return null;

  const handleUnlinkClick = async (shorlogId: number) => {
    if (!onUnlink) return;
    if (unlinkingId !== null) return;

    const ok = window.confirm('이 숏로그 연결을 해제할까요?');
    if (!ok) return;

    setUnlinkingId(shorlogId);
    try {
      await onUnlink(shorlogId);
    } finally {
      setUnlinkingId(null);
    }
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">연결된 숏로그 {items.length}개</h2>
        </div>

        {/* 리스트 */}
        <div className="max-h-80 space-y-3 overflow-y-auto px-6 py-4">
          {loading && (
            <p className="py-6 text-center text-xs text-slate-400">
              연결된 숏로그를 불러오는 중입니다...
            </p>
          )}

          {!loading && items.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">연결된 숏로그가 없습니다.</p>
          )}

          {!loading &&
            items.map((item) => (
              <div
                key={item.shorlogId}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm hover:bg-slate-100 hover:border-sky-300 transition-all"
              >
                <div
                  onClick={() => {
                    onClose();
                    router.push(`/shorlog/${item.shorlogId}`);
                  }}
                  className="flex-1 cursor-pointer text-xs text-slate-700"
                >
                  <p className="line-clamp-2 font-medium text-slate-900">{item.comment}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {new Date(item.modifiedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlinkClick(item.shorlogId);
                  }}
                  disabled={unlinkingId === item.shorlogId}
                  aria-label="연결 해제"
                  className={[
                    'shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full border border-slate-200 bg-white',
                    'text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all duration-150',
                    unlinkingId === item.shorlogId ? 'cursor-default opacity-60' : 'cursor-pointer',
                  ].join(' ')}
                >
                  {unlinkingId === item.shorlogId ? (
                    <span className="animate-pulse text-[10px]">···</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 
                        1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            ))}
        </div>

        {/* 푸터 */}
        <div className="flex justify-center border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-[#2979FF] px-4 py-2 text-xs font-medium text-white hover:bg-[#1f63d1] "
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
