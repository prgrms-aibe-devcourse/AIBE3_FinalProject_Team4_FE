'use client';

import type { LinkedShorlogSummary } from '@/src/types/blog';
import { useRouter } from 'next/navigation';
type Props = {
  open: boolean;
  loading: boolean;
  items: LinkedShorlogSummary[];
  onClose: () => void;
};

export function LinkedShorlogListModal({ open, loading, items, onClose }: Props) {
  const router = useRouter();
  if (!open) return null;

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
                onClick={() => {
                  onClose();
                  router.push(`/shorlog/${item.shorlogId}`);
                }}
                className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 
                  text-xs text-slate-700 shadow-sm hover:bg-slate-100 hover:border-sky-300 
                  transition-all"
              >
                <p className="line-clamp-2 font-medium text-slate-900">{item.comment}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {new Date(item.modifiedAt).toLocaleString('ko-KR')}
                </p>
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
