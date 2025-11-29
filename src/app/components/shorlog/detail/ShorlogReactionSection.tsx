'use client';

import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import LikeButton from '../../common/LikeButton';
import BookmarkButton from '../../common/BookmarkButton';
import ShareModal from './ShareModal';

interface Props {
  shorlogId: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  title: string;
  description: string;
  imageUrl: string | null;
  author: string;
}

export default function ShorlogReactionSection({
  shorlogId,
  likeCount,
  commentCount,
  bookmarkCount: initialBookmarkCount,
  title,
  description,
  imageUrl,
  author
}: Props) {
  const [currentBookmarkCount, setCurrentBookmarkCount] = useState(initialBookmarkCount);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleBookmarkChange = (isBookmarked: boolean, bookmarkCount?: number) => {
    if (bookmarkCount !== undefined) {
      setCurrentBookmarkCount(bookmarkCount);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <>
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
            initialBookmarked={false}
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
          className="flex items-center text-sky-500 transition hover:text-sky-600"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      <ShareModal
        shorlogId={shorlogId}
        title={title}
        description={description}
        imageUrl={imageUrl}
        author={author}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
}
