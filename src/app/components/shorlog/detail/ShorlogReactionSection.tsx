'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Send } from 'lucide-react';
import { requireAuth } from '../../../../lib/auth';

interface Props {
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
}

export default function ShorlogReactionSection({ likeCount, commentCount, bookmarkCount }: Props) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const displayLike = likeCount + (liked ? 1 : 0);
  const displayBookmark = bookmarkCount + (bookmarked ? 1 : 0);

  const handleLike = () => {
    if (!requireAuth('좋아요')) return;
    setLiked((prev) => !prev);
  };

  const handleBookmark = () => {
    if (!requireAuth('북마크')) return;
    setBookmarked((prev) => !prev);
  };

  const handleShare = () => {
    alert('공유 기능은 추후 제공될 예정입니다.');
  };

  return (
    <div className="flex items-center justify-between text-[13px] text-slate-700">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleLike}
          className="flex items-center gap-1.5 text-slate-700 transition hover:text-slate-900"
          aria-label={liked ? '좋아요 취소' : '좋아요'}
        >
          <Heart
            className={`h-5 w-5 transition-transform ${liked ? 'scale-110 text-rose-500' : 'text-slate-700'}`}
            fill={liked ? '#f97373' : 'none'}
          />
          <span className="text-[13px] font-medium">{displayLike}</span>
        </button>

        <div className="flex items-center gap-1.5 text-slate-700">
          <MessageCircle className="h-5 w-5" />
          <span className="text-[13px] font-medium">{commentCount}</span>
        </div>

        <button
          type="button"
          onClick={handleBookmark}
          className="flex items-center gap-1.5 text-slate-700 transition hover:text-slate-900"
          aria-label={bookmarked ? '북마크 취소' : '북마크'}
        >
          <Bookmark
            className={`h-5 w-5 transition-transform ${bookmarked ? 'scale-110 text-sky-500' : 'text-slate-700'}`}
            fill={bookmarked ? '#38bdf8' : 'none'}
          />
          <span className="text-[13px] font-medium">{displayBookmark}</span>
        </button>
      </div>

      <button type="button" onClick={handleShare} aria-label="공유" className="flex items-center text-slate-600 transition hover:text-slate-900">
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
