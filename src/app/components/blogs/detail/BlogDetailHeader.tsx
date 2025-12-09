'use client';

import type { BlogDetailDto } from '@/src/types/blog';
import { EllipsisVertical } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { BlogAuthorFollowSection } from './BlogAuthorFolowingSection';
import { BlogOwnerActionSheet } from './BlogOwnerActionSheet';
type BlogDetailHeaderProps = {
  blog: BlogDetailDto;
  isOwner: boolean;
  initialIsFollowing: boolean;
  onDelete?: () => Promise<void> | void;
  onEdit?: () => void;
  onConnectShorlog?: () => void;
};

export function BlogDetailHeader({
  blog,
  isOwner,
  initialIsFollowing,
  onDelete,
  onEdit,
  onConnectShorlog,
}: BlogDetailHeaderProps) {
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);

  const created = new Date(blog.createdAt);
  const formattedDate = created.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <header className="border-b border-slate-100 px-5 pb-6 pt-5 sm:px-8 sm:pt-7 overflow-x-hidden">
        <div className="flex flex-col gap-6">
          {/* 라벨 + 뷰/댓글 */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-600">
                BLOG STORY
              </p>
              {/* {blog.hasLinkedShorlogs && (
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
                  ⚡ 연결된 숏로그 {blog.linkedShorlogCount}
                </span>
              )} */}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>조회 {blog.viewCount.toLocaleString()}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>댓글 {blog.commentCount}</span>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[32px] leading-snug">
              {blog.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              짧게 스쳐간 순간을, 천천히 되짚어보는 공간입니다.
            </p>
          </div>

          {/* 작성자 + 액션 */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href={`/profile/${blog.userId}`} className="group flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                <img
                  src={blog.profileImageUrl || '/tmpProfile.png'}
                  alt={`${blog.nickname} 프로필 이미지`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-900">{blog.nickname}</span>
                  <span className="text-xs text-slate-400">@{blog.username}</span>
                </div>
                <span className="text-[11px] text-slate-400">{formattedDate}</span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <BlogAuthorFollowSection
                blog={blog}
                isOwner={isOwner}
                initialIsFollowing={initialIsFollowing}
              />

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setOwnerSheetOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                >
                  <EllipsisVertical className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-col gap-6">
        {blog.thumbnailUrl && (
          <div className="px-5 sm:px-8">
            <div className="mt-3 w-full max-w-sm sm:max-w-md">
              <img
                src={blog.thumbnailUrl}
                alt="블로그 썸네일"
                className="max-h-[300px] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        )}
        <div className="border-t border-slate-100 px-5 pb-1 pt-5 sm:px-11 sm:pt-6 overflow-x-hidden" />
        {isOwner && (
          <BlogOwnerActionSheet
            open={ownerSheetOpen}
            onClose={() => setOwnerSheetOpen(false)}
            onDelete={() => onDelete?.()}
            onEdit={() => onEdit?.()}
            onConnectShorlog={() => onConnectShorlog?.()}
          />
        )}
      </div>
    </>
  );
}
