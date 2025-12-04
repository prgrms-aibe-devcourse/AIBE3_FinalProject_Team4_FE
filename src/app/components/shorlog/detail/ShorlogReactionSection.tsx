'use client';

import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

import { useRequireAuth } from '@/src/hooks/userRequireAuth';
import BookmarkButton from '../../common/BookmarkButton';
import LikeButton from '../../common/LikeButton';
import ShareModal from './ShareModal';

interface Props {
  shorlogId: number;
  authorId: number;
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
  authorId,
  likeCount,
  commentCount,
  bookmarkCount,
  title,
  description,
  imageUrl,
  author,
}: Props) {
  const [currentBookmarkCount, setCurrentBookmarkCount] = useState(bookmarkCount);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  /** 로그인 여부 체크 Hook */
  const requireAuth = useRequireAuth();

  /** 북마크 변경 핸들러 */
  const handleBookmarkChange = (isBookmarked: boolean, newCount?: number) => {
    if (newCount !== undefined) {
      setCurrentBookmarkCount(newCount);
    } else {
      // fallback (old 방식: 로컬 증가)
      setCurrentBookmarkCount((prev) => prev + (isBookmarked ? 1 : -1));
    }
  };

  /** 공유 버튼 클릭 */
  const handleShare = () => {
    if (!requireAuth('공유')) return;

    setIsShareModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between text-[13px] text-slate-700">
        <div className="flex items-center gap-4">
          {/* 좋아요 */}
          <LikeButton
            shorlogId={shorlogId}
            authorId={authorId}
            initialLikeCount={likeCount}
            variant="small"
            showCount={true}
          />

          {/* 댓글 */}
          <div className="flex items-center gap-1.5 text-slate-700">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[13px] font-medium">{commentCount}</span>
          </div>

          {/* 북마크 */}
          <div className="flex items-center gap-1.5 text-slate-700">
            <BookmarkButton
              shorlogId={shorlogId}
              authorId={authorId}
              initialBookmarked={false}
              onBookmarkChange={handleBookmarkChange}
              variant="small"
            />
            <span className="text-[13px] font-medium">{currentBookmarkCount}</span>
          </div>
        </div>

        {/* 공유 */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="공유"
          className="flex items-center text-sky-500 transition hover:text-sky-600"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* 공유 모달 */}
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
