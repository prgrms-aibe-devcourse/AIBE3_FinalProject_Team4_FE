'use client';

import {
  addBookmark,
  increaseBlogView,
  likeBlog,
  removeBookmark,
  unlikeBlog,
} from '@/src/api/blogDetail';
import { fetchLinkedShorlogs, unlinkShorlog } from '@/src/api/blogShorlogLink';
import { fetchBlogView } from '@/src/api/viewApi';
import { BlogDetailHeader } from '@/src/app/components/blogs/detail/BlogDetailHeader';
import { BlogReactionBar } from '@/src/app/components/blogs/detail/BlogReactionBar';
import { useRegisterView } from '@/src/hooks/useRegisterView';
import { handleApiError } from '@/src/lib/handleApiError';
import { showGlobalToast } from '@/src/lib/toastStore';
import type {
  BlogDetailDto,
  BlogShorlogLinkResponse,
  LinkedShorlogSummary,
} from '@/src/types/blog';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LinkedShorlogListModal } from '../../components/blogs/detail/LinkedShorlogModal';
import BlogConnectShorlogModal from '../../components/blogs/link/BlogConnectShorlogModal';

type Props = {
  initialData: BlogDetailDto;
  isOwner: boolean;
  initialIsFollowing: boolean;
  onDelete: () => void;
  onEdit: () => void;
};

export default function BlogDetailClient({
  initialData,
  isOwner,
  initialIsFollowing,
  onDelete,
  onEdit,
}: Props) {
  const [blog] = useState<BlogDetailDto>(initialData); // 지금은 수정 안 하니까 그대로 유지
  const [viewCount, setViewCount] = useState(initialData.viewCount ?? 0);
  const [likeCount, setLikeCount] = useState(initialData.likeCount ?? 0);
  const [bookmarkCount, setBookmarkCount] = useState(initialData.bookmarkCount ?? 0);
  const [isLiked, setIsLiked] = useState(initialData.isLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState(initialData.isBookmarked ?? false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  // 연결된 숏로그 모달용 상태
  const [linkedOpen, setLinkedOpen] = useState(false);
  const [linkedLoading, setLinkedLoading] = useState(false);
  const [linkedItems, setLinkedItems] = useState<LinkedShorlogSummary[]>([]);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [hasLinkedShorlogs, setHasLinkedShorlogs] = useState(
    initialData.hasLinkedShorlogs ?? false,
  );
  const [linkedShorlogCount, setLinkedShorlogCount] = useState(initialData.linkedShorlogCount ?? 0);
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
        //console.error('조회수 증가 실패', e);
        // handleApiError(e, '조회수 증가');
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
  // 연결된 숏로그
  const handleOpenLinkedShorlogs = async () => {
    if (!hasLinkedShorlogs) return;

    try {
      setLinkedOpen(true);
      setLinkedLoading(true);

      const list = await fetchLinkedShorlogs(blog.id);
      setLinkedItems(list);

      if (list.length === 0) {
        showGlobalToast('연결된 숏로그가 아직 없어요.', 'info' as any);
      }
    } catch (e) {
      handleApiError(e, '연결된 숏로그 조회');
      setLinkedOpen(false); // 실패하면 모달 닫기
    } finally {
      setLinkedLoading(false);
    }
  };
  //
  const handleOpenConnectShorlog = () => {
    if (!isOwner) return; // 혹시 모를 방어
    setConnectModalOpen(true);
  };

  // 연결 완료 후 블로그 상태에 연결 정보 반영
  const handleLinkedShorlog = (res: BlogShorlogLinkResponse) => {
    setHasLinkedShorlogs(res.haveLink);
    setLinkedShorlogCount(res.linkedCount);
    setConnectModalOpen(false);
  };
  const handleUnlinkShorlog = async (shorlogId: number) => {
    try {
      const res = (await unlinkShorlog(blog.id, shorlogId)) as BlogShorlogLinkResponse;
      setLinkedItems((prev) => prev.filter((item) => item.shorlogId !== shorlogId));
      setHasLinkedShorlogs(res.haveLink);
      setLinkedShorlogCount(res.linkedCount);

      showGlobalToast('숏로그 연결을 해제했어요.', 'success');

      // 더 이상 연결된 숏로그가 없으면 모달 닫기
      if (!res.haveLink || res.linkedCount === 0) {
        setLinkedOpen(false);
      }
    } catch (e) {
      handleApiError(e, '숏로그 연결 해제');
    }
  };

  // 최근 본 게시물 등록
  const viewMutation = useMutation({
    mutationFn: () => fetchBlogView(blog.id),
  });

  useRegisterView({
    contentKey: `blog:${blog.id}`,
    cooldownMs: 10 * 60 * 1000, // (선택사항) 10분 쿨다운
    dwellMs: 9000,
    scrollThreshold: 0.5,
    noScrollRatio: 1.2,
    onRegister: () => viewMutation.mutate(),
  });

  return (
    <>
      {/* 연결된 숏로그 리스트 모달 */}
      <LinkedShorlogListModal
        open={linkedOpen}
        loading={linkedLoading}
        items={linkedItems}
        onClose={() => setLinkedOpen(false)}
        onUnlink={handleUnlinkShorlog}
      />
      <article className="rounded-3xl bg-white/90 shadow-xl ring-1 ring-slate-100 backdrop-blur-sm">
        {/* 상단 헤더 */}
        <BlogDetailHeader
          blog={{ ...blog, viewCount }}
          isOwner={isOwner}
          initialIsFollowing={initialIsFollowing}
          onDelete={onDelete}
          onEdit={onEdit}
          onConnectShorlog={handleOpenConnectShorlog}
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
          blog={{ ...blog, hasLinkedShorlogs, linkedShorlogCount }}
          isLiked={isLiked}
          likeCount={likeCount}
          isBookmarked={isBookmarked}
          bookmarkCount={bookmarkCount}
          onToggleLike={handleToggleLike}
          onToggleBookmark={handleToggleBookmark}
          onOpenLinkedShorlogs={handleOpenLinkedShorlogs}
          onShare={() => {
            navigator.clipboard.writeText(location.href);
            alert('공유 링크 복사됨');
          }}
        />
      </article>
      <BlogConnectShorlogModal
        isOpen={connectModalOpen}
        blogId={blog.id}
        onClose={() => setConnectModalOpen(false)}
        onLinked={handleLinkedShorlog}
        showCreateShorlogCta={false}
        onCreateNewShorlog={() => {}}
      />
    </>
  );
}
