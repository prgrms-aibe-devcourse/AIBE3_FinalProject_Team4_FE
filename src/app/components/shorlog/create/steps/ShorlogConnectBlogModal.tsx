'use client';

import React from 'react';
import { ShorlogRelatedBlogSummary } from '../types';

interface ShorlogConnectBlogModalProps {
  isOpen: boolean;
  recentBlogs: ShorlogRelatedBlogSummary[];
  onSelectBlog: (blogId: ShorlogRelatedBlogSummary['id']) => void;
  onCreateNewBlog: () => void;
  onSkip: () => void;
}

export default function ShorlogConnectBlogModal({
                                                  isOpen,
                                                  recentBlogs,
                                                  onSelectBlog,
                                                  onCreateNewBlog,
                                                  onSkip,
                                                }: ShorlogConnectBlogModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shorlog-connect-blog-title"
    >
      <div className="w-full max-w-[520px] rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-4">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            {/* 체크 아이콘 느낌 (텍스트로) */}
            <span className="text-sm font-semibold">✓</span>
          </div>
          <div>
            <h2
              id="shorlog-connect-blog-title"
              className="text-sm font-semibold text-slate-900"
            >
              숏로그 작성완료!
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              연관된 블로그와 연결하시겠어요?
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* Body */}
        <div className="px-6 py-5">
          {/* 섹션 타이틀 */}
          <p className="mb-3 text-xs font-semibold text-slate-700">
            최근 블로그 중 선택
          </p>

          {/* 최근 블로그 리스트 */}
          <div className="mb-4 max-h-52 space-y-2 overflow-y-auto pr-1">
            {recentBlogs.map((blog) => (
              <button
                key={blog.id}
                type="button"
                onClick={() => onSelectBlog(blog.id)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-xs text-slate-800 shadow-sm transition hover:border-[#2979FF] hover:bg-[#f3f6ff]"
              >
                <p className="line-clamp-2 text-[13px] font-medium leading-snug">
                  {blog.title}
                </p>
                {blog.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-[3px] text-[10px] text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>+{Math.max(blog.tags.length - 2, 0) > 0 ? blog.tags.length - 2 : 0}</span>
                  <span>{blog.createdAtText}</span>
                </div>
              </button>
            ))}

            {recentBlogs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
                <p className="text-[11px] text-slate-500">
                  아직 연결된 블로그가 없어요.
                  <br />
                  아래에서 새 블로그를 작성해 연결해 보세요.
                </p>
              </div>
            )}
          </div>

          {/* 새 블로그 작성 카드 */}
          <button
            type="button"
            onClick={onCreateNewBlog}
            className="flex w-full items-center justify-center rounded-2xl border border-dashed border-[#2979FF]/70 bg-[#f4f7ff] px-4 py-4 text-[13px] font-medium text-[#1f63d1] shadow-sm transition hover:bg-[#e4edff]"
          >
            <span className="mr-1 text-base">+</span>
            <span>블로그 새로 작성하기</span>
          </button>
        </div>

        <div className="h-px bg-slate-200" />

        {/* Footer */}
        <div className="flex justify-center px-6 py-4">
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex min-w-[140px] items-center justify-center rounded-full bg-[#2979FF] px-5 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-[#1f63d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
}
