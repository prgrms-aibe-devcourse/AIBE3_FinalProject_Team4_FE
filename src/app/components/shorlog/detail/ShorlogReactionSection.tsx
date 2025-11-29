'use client';

import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import LikeButton from '../../common/LikeButton';
import BookmarkButton from '../../common/BookmarkButton';

interface Props {
  shorlogId: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
}

export default function ShorlogReactionSection({
  shorlogId,
  likeCount,
  commentCount,
  bookmarkCount: initialBookmarkCount
}: Props) {
  const [currentBookmarkCount, setCurrentBookmarkCount] = useState(initialBookmarkCount);

  const handleBookmarkChange = (isBookmarked: boolean, bookmarkCount?: number) => {
    if (bookmarkCount !== undefined) {
      setCurrentBookmarkCount(bookmarkCount);
    }
  };

  const handleShare = () => {
    alert('공유 기능은 추후 제공될 예정입니다.');
  };

  return (
    <div className="flex items-center justify-between text-[13px] text-slate-700">
      <div className="flex items-center gap-4">
        <LikeButton
          shorlogId={shorlogId}
          initialLikeCount={likeCount}
          variant="small"
          showCount={true}
        />

        <div className="flex items-center gap-1.5 text-slate-700">
          <MessageCircle className="h-5 w-5" />
          <span className="text-[13px] font-medium">{commentCount}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-700">
          <BookmarkButton
            shorlogId={shorlogId}
            initialBookmarked={false} // TODO: 서버에서 북마크 상태 받아오기
            onBookmarkChange={handleBookmarkChange}
            variant="small"
          />
          <span className="text-[13px] font-medium">{currentBookmarkCount}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        aria-label="공유"
        className="flex items-center text-slate-600 transition hover:text-slate-900"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
