'use client';

import type { BlogDetailDto } from "@/src/types/blog";
import { Bookmark, BookmarkCheck, Heart, MessageCircle, Share2 } from 'lucide-react';

type BlogReactionBarProps = {
  blog: BlogDetailDto;
  isLiked: boolean;
  likeCount: number;
  isBookmarked: boolean;
  bookmarkCount: number;
  onToggleLike?: () => void;
  onToggleBookmark?: () => void;
  onOpenLinkedShorlogs?: () => void;
  onShare?: () => void;
};

export function BlogReactionBar({
  blog,
  isLiked,
  likeCount,
  isBookmarked,
  bookmarkCount,
  onToggleLike,
  onToggleBookmark,
  onOpenLinkedShorlogs,
  onShare,
}: BlogReactionBarProps) {
 const liked = isLiked;
 const bookmarked = isBookmarked;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-500 sm:px-8">
      <div className="flex items-center gap-3">
        {/* 좋아요 */}
        <button
          type="button"
          onClick={onToggleLike}
          className={[
            'inline-flex items-center gap-1 rounded-full border px-3 py-1 transition-colors',
            liked
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-slate-200 bg-white hover:border-rose-200 hover:text-rose-500',
          ].join(' ')}
        >
          <Heart className="h-3.5 w-3.5" fill={liked ? 'currentColor' : 'none'} />
          <span className="font-medium">{likeCount}</span>
        </button>

        {/* 북마크 */}
        <button
          type="button"
          onClick={onToggleBookmark}
          className={[
            'inline-flex items-center gap-1 rounded-full border px-3 py-1 transition-colors',
            bookmarked
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-slate-200 bg-white hover:border-amber-200 hover:text-amber-600',
          ].join(' ')}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-3.5 w-3.5" />
          ) : (
            <Bookmark className="h-3.5 w-3.5" />
          )}
          <span className="font-medium">{bookmarkCount}</span>
        </button>

        {/* 연결된 숏로그 보기 */}
        {blog.hasLinkedShorlogs && (
          <button
            type="button"
            onClick={onOpenLinkedShorlogs}
            className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-100"
          >
            ⚡ 숏로그 {blog.linkedShorlogCount}개 보기
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <div className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-slate-500">
          <MessageCircle className="h-3.5 w-3.5" />
          <span>댓글 {blog.commentCount}</span>
        </div>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-slate-500 hover:bg-slate-100"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>공유</span>
        </button>
      </div>
    </div>
  );
}
