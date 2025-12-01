'use client';

import { useState } from 'react';
import type { BlogDetailDto } from '@/src/types/blog';
import { BlogOwnerActionSheet } from './BlogOwnerActionSheet';
import { EllipsisVertical, UserPlus, Check } from 'lucide-react';

type BlogDetailHeaderProps = {
  blog: BlogDetailDto;
  isOwner: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onEdit?: () => void;
  onConnectShorlog?: () => void;
  onShare?: () => void;
};

export function BlogDetailHeader({
  blog,
  isOwner,
  isFollowing = false,
  onToggleFollow,
  onDelete,
  onEdit,
  onConnectShorlog,
  onShare,
}: BlogDetailHeaderProps) {
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const created = new Date(blog.createdAt);
  const formattedDate = created.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleFollowClick = async () => {
    if (!onToggleFollow) return;
    try {
      setFollowLoading(true);
      await onToggleFollow();
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <>
      <header className="border-b border-slate-100 px-5 pb-6 pt-5 sm:px-8 sm:pt-7">
        <div className="flex flex-col gap-6">
          {/* 라벨 + 뷰/댓글 */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-600">
                BLOG STORY
              </p>
              {blog.hasLinkedShorlogs && (
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
                  ⚡ 연결된 숏로그 {blog.linkedShorlogCount}
                </span>
              )}
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
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                {blog.profileImageUrl ? (
                  <img
                    src={blog.profileImageUrl}
                    alt={`${blog.nickname} 프로필 이미지`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                    {blog.nickname?.[0] ?? '?'}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-900">{blog.nickname}</span>
                  <span className="text-xs text-slate-400">@{blog.username}</span>
                </div>
                <span className="text-[11px] text-slate-400">{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isOwner && (
                <button
                  type="button"
                  disabled={followLoading}
                  onClick={handleFollowClick}
                  className={[
                    'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-[#2979FF] text-white hover:bg-[#1f5ecc]',
                  ].join(' ')}
                >
                  {isFollowing ? '팔로잉' : '팔로우'}
                </button>
              )}

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

          {blog.thumbnailUrl && (
            <div className="mt-2 max-w-md">
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <img src={blog.thumbnailUrl} alt="블로그 썸네일" className="w-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </header>

      {isOwner && (
        <BlogOwnerActionSheet
          open={ownerSheetOpen}
          onClose={() => setOwnerSheetOpen(false)}
          onDelete={() => onDelete?.()}
          onEdit={() => onEdit?.()}
          onConnectShorlog={() => onConnectShorlog?.()}
        />
      )}
    </>
  );
}
