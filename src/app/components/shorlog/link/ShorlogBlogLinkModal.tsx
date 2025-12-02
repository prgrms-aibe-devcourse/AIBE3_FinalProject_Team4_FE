'use client';

import {
  fetchMyRecentBlogs,
  linkShorlogToBlog
} from '@/src/api/blogShorlogLink';
import { handleApiError } from '@/src/lib/handleApiError';
import { showGlobalToast } from '@/src/lib/toastStore';
import type { ShorlogBlogLinkResponse, MyBlogSummary } from '@/src/types/blog';
import { formatRelativeTime } from '@/src/utils/time';
import { useEffect, useState } from 'react';

type ShorlogBlogLinkModalProps = {
  isOpen: boolean;
  shorlogId: number;
  onClose: () => void;
  onLinked?: (res: ShorlogBlogLinkResponse) => void;
  onUnlinked?: () => void;
};

export default function ShorlogBlogLinkModal({
  isOpen,
  shorlogId,
  onClose,
  onLinked,
  onUnlinked,
}: ShorlogBlogLinkModalProps) {
  const [recentBlogs, setRecentBlogs] = useState<MyBlogSummary[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const blogsList = await fetchMyRecentBlogs(7);

        if (!cancelled) {
          setRecentBlogs(blogsList);
        }
      } catch (e) {
        if (!cancelled) {
          handleApiError(e, '블로그 정보 조회');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen, shorlogId]);

  if (!isOpen) return null;

  const handleSelectBlog = async (blogId: number) => {
    if (linking) return;
    setSelectedBlogId(blogId);
    try {
      setLinking(true);
      const res = await linkShorlogToBlog(shorlogId, blogId);

      onLinked?.(res);
      onClose();
    } catch (e) {
      handleApiError(e, '블로그 연결');
    } finally {
      setLinking(false);
      setSelectedBlogId(null);
    }
  };



  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shorlog-blog-link-title"
    >
      <div className="w-full max-w-[600px] rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-start gap-4 px-8 pt-8 pb-6">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <span className="text-base font-semibold">🔗</span>
          </div>
          <div>
            <h2 id="shorlog-blog-link-title" className="text-lg font-semibold text-slate-900">
              블로그 연결 관리
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              이 숏로그와 연결할 블로그를 선택해 보세요.
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* Body */}
        <div className="px-8 py-6">
          {/* 블로그 연결 섹션 */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50">
              <span className="text-sm text-blue-600">📋</span>
            </div>
            <p className="text-sm font-semibold text-slate-700">연결할 블로그 선택</p>
            <div className="ml-3 h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          </div>

          {/* 최근 블로그 리스트 */}
          <div className="mb-5 max-h-60 overflow-y-auto space-y-3 pr-1 scroll-smooth">
            {loading && (
              <p className="py-6 text-center text-xs text-slate-400">
                블로그 목록을 불러오는 중입니다...
              </p>
            )}

            {!loading &&
              recentBlogs.map((item, index) => {
                const isSelected = selectedBlogId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={linking}
                    onClick={() => handleSelectBlog(item.id)}
                    className={[
                      'group w-full rounded-2xl border px-5 py-4 text-left text-slate-800 shadow-sm transition-all duration-200',
                      'bg-white hover:scale-[1.01] hover:bg-[#f3f6ff] hover:shadow-md disabled:opacity-60',
                      // 선택 상태일 때 ring + 진한 테두리
                      isSelected
                        ? 'border-[#2979FF] ring-2 ring-[#2979FF]/40'
                        : 'border-slate-200 hover:border-[#2979FF]',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[15px] font-medium leading-snug text-slate-900 group-hover:text-slate-800">
                          {item.title}
                        </p>

                        {item.hashtagNames && item.hashtagNames.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {item.hashtagNames.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={`${item.id}-tag-${tagIndex}`}
                                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700"
                              >
                                <span className="mr-1">#</span>
                                {tag}
                              </span>
                            ))}
                            {item.hashtagNames.length > 3 && (
                              <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-500">
                                +{item.hashtagNames.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <span>{formatRelativeTime(item.modifiedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400 transition-colors group-hover:text-blue-500">
                            <span>연결하기</span>
                            <span className="transition-transform group-hover:translate-x-0.5">
                              →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

            {!loading && recentBlogs.length === 0 && (
              <div className="relative rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-100 px-3 py-1"></div>
                <span className="text-xs text-slate-500">📝</span>
                <div className="pt-2">
                  <p className="mb-1 text-sm font-medium text-slate-600">
                    아직 작성된 블로그가 없어요
                  </p>
                  <p className="text-xs text-slate-500">
                    숏로그와 함께 보여줄 자세한 글을 먼저 작성해 보세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* Footer */}
        <div className="flex justify-center gap-3 px-8 py-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center min-w-[120px] justify-center rounded-full bg-slate-600 px-4 py-2 text-[14px] font-medium text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
