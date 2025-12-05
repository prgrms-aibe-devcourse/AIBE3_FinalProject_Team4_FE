'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { unlinkShorlogFromBlog } from '@/src/api/blogShorlogLink';
import { showGlobalToast } from '@/src/lib/toastStore';
import { handleApiError } from '@/src/lib/handleApiError';
import type { LinkedBlogDetail } from '@/src/types/blog';

type Props = {
  open: boolean;
  loading: boolean;
  items: LinkedBlogDetail[];
  shorlogId: number;
  isOwner: boolean;
  onClose: () => void;
  onUnlinked?: () => void;
};

export function LinkedBlogListModal({
  open,
  loading,
  items,
  shorlogId,
  isOwner,
  onClose,
  onUnlinked
}: Props) {
  const router = useRouter();
  const [unlinking, setUnlinking] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<LinkedBlogDetail | null>(null);

  if (!open) return null;

  const handleUnlinkBlog = (blog: LinkedBlogDetail, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isOwner) return;

    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const confirmUnlink = async () => {
    if (!blogToDelete || unlinking) return;

    setUnlinking(blogToDelete.id);
    try {
      await unlinkShorlogFromBlog(shorlogId, blogToDelete.id);
      showGlobalToast('블로그 연결을 해제했어요.', 'success');
      onUnlinked?.();
    } catch (error) {
      handleApiError(error, '블로그 연결 해제');
    } finally {
      setUnlinking(null);
      setShowDeleteModal(false);
      setBlogToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            연결된 블로그 {items.length}개
          </h2>
        </div>

        {/* 리스트 */}
        <div className="max-h-80 space-y-3 overflow-y-auto px-6 py-4">
          {loading && (
            <p className="py-6 text-center text-xs text-slate-400">
              연결된 블로그를 불러오는 중입니다...
            </p>
          )}

          {!loading && items.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">연결된 블로그가 없습니다.</p>
          )}

          {!loading &&
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onClose();
                  router.push(`/blogs/${item.id}`);
                }}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3
                  text-xs text-slate-700 shadow-sm hover:bg-blue-50 hover:border-blue-300
                  transition-all relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-2 font-medium text-slate-900">
                      {item.contentPre || item.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[10px] text-slate-400">
                        {new Date(item.modifiedAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>

                  {/* X 버튼 (소유자만) */}
                  {isOwner && (
                    <button
                      type="button"
                      disabled={unlinking === item.id}
                      onClick={(e) => handleUnlinkBlog(item, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* 푸터 */}
        <div className="flex justify-center border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-[#2979FF] px-4 py-2 text-xs font-medium text-white hover:bg-[#1f63d1] transition"
          >
            닫기
          </button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && blogToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">연결 해제</h3>
            <p className="mt-2 text-sm text-slate-600">
              "{blogToDelete.title}"와(과)의 연결을 해제하시겠습니까?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setBlogToDelete(null);
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmUnlink}
                disabled={unlinking === blogToDelete.id}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {unlinking === blogToDelete.id ? '해제 중...' : '해제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
