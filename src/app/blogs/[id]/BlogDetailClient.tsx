'use client';

import {
  addBookmark,
  increaseBlogView,
  likeBlog,
  removeBookmark,
  unlikeBlog,
} from '@/src/api/blogDetail';
import { BlogDetailHeader } from '@/src/app/components/blogs/detail/BlogDetailHeader';
import { BlogReactionBar } from '@/src/app/components/blogs/detail/BlogReactionBar';
import type { BlogDetailDto } from '@/src/types/blog';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { handleApiError } from '@/src/lib/handleApiError';
import { showGlobalToast } from '@/src/lib/toastStore';

type Props = {
  initialData: BlogDetailDto;
  isOwner: boolean;
  onDelete: () => void;
  onEdit: () => void;
};

export default function BlogDetailClient({ initialData, isOwner, onDelete, onEdit }: Props) {
  const [blog] = useState<BlogDetailDto>(initialData); // 지금은 수정 안 하니까 그대로 유지
  const [viewCount, setViewCount] = useState(initialData.viewCount ?? 0);
  const [likeCount, setLikeCount] = useState(initialData.likeCount ?? 0);
  const [bookmarkCount, setBookmarkCount] = useState(initialData.bookmarkCount ?? 0);
  const [isLiked, setIsLiked] = useState(initialData.isLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState(initialData.isBookmarked ?? false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // 조회수 증가
  useEffect(() => {
    let cancelled = false;
    increaseBlogView(initialData.id)
      .then((dto) => {
        if (!cancelled) {
          setViewCount(dto.viewCount);
        }
      })
      .catch((e) => {
        console.error('조회수 증가 실패', e);
        // 여기서는 토스트 안 띄우고 로그만, 혹은 필요하면 handleApiError(e, '조회수 증가');
      });

    return () => {
      cancelled = true;
    };
  }, [initialData.id]);

  // 좋아요 토글
  const handleToggleLike = async () => {
    if (likeLoading) return;

    const prevLiked = isLiked;
    const prevCount = likeCount;

    setLikeLoading(true);
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const dto = prevLiked ? await unlikeBlog(blog.id) : await likeBlog(blog.id);
      setIsLiked(dto.isLiked);
      setLikeCount(dto.likeCount);
    } catch (e) {
      handleApiError(e, '좋아요 처리');

      // 낙관적 업데이트 롤백
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  };

  // 북마크 토글
  const handleToggleBookmark = async () => {
    if (bookmarkLoading) return;

    const prevMarked = isBookmarked;
    const prevCount = bookmarkCount;

    setBookmarkLoading(true);
    setIsBookmarked(!prevMarked);
    setBookmarkCount(prevMarked ? prevCount - 1 : prevCount + 1);

    try {
      const dto = prevMarked
        ? await removeBookmark(initialData.id)
        : await addBookmark(initialData.id);

      setIsBookmarked(dto.isBookmarked);
      setBookmarkCount(dto.bookmarkCount);
    } catch (e) {
      //console.error('북마크 토글 실패', e);
      handleApiError(e, '북마크 처리');

      setIsBookmarked(prevMarked);
      setBookmarkCount(prevCount);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <article className="rounded-3xl bg-white/90 shadow-xl ring-1 ring-slate-100 backdrop-blur-sm">
      {/* 상단 헤더 */}
      <BlogDetailHeader
        blog={{ ...blog, viewCount }}
        isOwner={isOwner}
        onDelete={onDelete}
        onEdit={onEdit}
        onConnectShorlog={() => alert('숏로그 연결 예정')}
        onShare={() => {
          navigator.clipboard.writeText(location.href);
          alert('링크가 복사되었습니다');
        }}
      />

      {/* 본문 */}
      <section className="px-5 py-8 sm:px-8">
        <div className="prose prose-slate max-w-none leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
        </div>

        {/* 태그 */}
        {blog.hashtagNames.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {blog.hashtagNames.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 리액션 바 */}
      <BlogReactionBar
        blog={{
          ...blog,
          viewCount,
          likeCount,
          bookmarkCount,
          isLiked,
          isBookmarked,
        }}
        onToggleLike={handleToggleLike}
        onToggleBookmark={handleToggleBookmark}
        onOpenLinkedShorlogs={() => alert('연결 숏로그 보기 예정')}
        onShare={() => {
          navigator.clipboard.writeText(location.href);
          alert('공유 링크 복사됨');
        }}
      />
    </article>
  );
}
