'use client';

import React, { useState, useEffect } from 'react';
import { ShorlogRelatedBlogSummary } from '../types';
import { formatRelativeTime } from '@/src/utils/time';
import { fetchMyRecentBlogs, linkShorlogToBlog } from '@/src/api/blogShorlogLink';
import { showGlobalToast } from '@/src/lib/toastStore';
import { handleApiError } from '@/src/lib/handleApiError';
import type { MyBlogSummary } from '@/src/types/blog';

interface ShorlogConnectBlogModalProps {
  isOpen: boolean;
  shorlogId: number;
  recentBlogs: ShorlogRelatedBlogSummary[];
  onSelectBlog: (blogId: ShorlogRelatedBlogSummary['id']) => void;
  onCreateNewBlog: () => void;
  onSkip: () => void;
  isEditMode?: boolean; // 수정 모드인지 여부
}

export default function ShorlogConnectBlogModal({
                                                  isOpen,
                                                  shorlogId,
                                                  recentBlogs,
                                                  onSelectBlog,
                                                  onCreateNewBlog,
                                                  onSkip,
                                                  isEditMode = false,
                                                }: ShorlogConnectBlogModalProps) {
  const [myRecentBlogs, setMyRecentBlogs] = useState<MyBlogSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadRecentBlogs = async () => {
      try {
        setLoading(true);
        const blogs = await fetchMyRecentBlogs(7);
        setMyRecentBlogs(blogs);
      } catch (error) {
        handleApiError(error, '최근 블로그 조회');
      } finally {
        setLoading(false);
      }
    };

    loadRecentBlogs();
  }, [isOpen]);

  const handleBlogSelect = async (blogId: number) => {
    if (linking) return;

    try {
      setLinking(true);
      setSelectedBlogId(blogId);

      await linkShorlogToBlog(shorlogId, blogId);
      showGlobalToast('숏로그와 블로그가 연결되었어요!', 'success');

      onSelectBlog(blogId);
    } catch (error) {
      handleApiError(error, '블로그 연결');
    } finally {
      setLinking(false);
      setSelectedBlogId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shorlog-connect-blog-title"
    >
      <div className="w-full max-w-[600px] rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-start gap-4 px-8 pt-8 pb-6">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            {/* 체크 아이콘 느낌 (텍스트로) */}
            <span className="text-base font-semibold">✓</span>
          </div>
          <div>
            <h2
              id="shorlog-connect-blog-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEditMode ? '블로그 추가 연결' : '숏로그 작성완료!'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              연관된 블로그와 연결하시겠어요?
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* Body */}
        <div className="px-8 py-6">
          {/* 섹션 타이틀 */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50">
              <span className="text-sm text-blue-600">📋</span>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              최근 블로그 중 선택
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-3"></div>
          </div>

          {/* 최근 블로그 리스트 */}
          <div className="mb-5 max-h-60 space-y-3 overflow-y-auto pr-1">
            {loading && (
              <p className="py-6 text-center text-xs text-slate-400">
                최근 블로그를 불러오는 중입니다...
              </p>
            )}

            {!loading && myRecentBlogs.map((blog, index) => {
              const isSelected = selectedBlogId === blog.id;
              return (
                <button
                  key={blog.id}
                  type="button"
                  disabled={linking}
                  onClick={() => handleBlogSelect(blog.id)}
                  className={[
                    'group w-full rounded-2xl border px-5 py-4 text-left text-slate-800 shadow-sm transition-all duration-200',
                    'bg-white hover:scale-[1.01] hover:bg-[#f3f6ff] hover:shadow-md disabled:opacity-60',
                    isSelected
                      ? 'border-[#2979FF] ring-2 ring-[#2979FF]/40'
                      : 'border-slate-200 hover:border-[#2979FF]',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 text-[15px] font-medium leading-snug text-slate-900 group-hover:text-slate-800">
                        {blog.title}
                      </p>



                      {blog.hashtagNames && blog.hashtagNames.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {blog.hashtagNames.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={`${blog.id}-tag-${tagIndex}`}
                              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
                            >
                              <span className="mr-1">#</span>
                              {tag}
                            </span>
                          ))}
                          {blog.hashtagNames.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-500">
                              +{blog.hashtagNames.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <span>{formatRelativeTime(blog.modifiedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-blue-500 transition-colors">
                          <span>연결하기</span>
                          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {!loading && myRecentBlogs.length === 0 && (
              <div className="relative rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-100 px-3 py-1">
                  <span className="text-xs text-slate-500">📝</span>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-slate-600 font-medium mb-1">
                    아직 작성된 블로그가 없어요
                  </p>
                  <p className="text-xs text-slate-500">
                    아래에서 새 블로그를 작성해 연결해 보세요
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 새 블로그 작성 카드 */}
          <button
            type="button"
            onClick={onCreateNewBlog}
            className="flex w-full items-center justify-center rounded-2xl border border-dashed border-[#2979FF]/70 bg-[#f4f7ff] px-5 py-5 text-[15px] font-medium text-[#1f63d1] shadow-sm transition hover:bg-[#e4edff]"
          >
            <span className="mr-1.5 text-lg">+</span>
            <span>블로그 새로 작성하기</span>
          </button>
        </div>

        <div className="h-px bg-slate-200" />

        {/* Footer */}
        <div className="flex justify-center px-8 py-5">
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex min-w-[160px] items-center justify-center rounded-full bg-[#2979FF] px-6 py-3 text-[15px] font-medium text-white shadow-sm transition hover:bg-[#1f63d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
}
