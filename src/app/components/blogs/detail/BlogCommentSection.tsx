'use client';

import {
  createBlogComment,
  deleteBlogComment,
  editBlogComment,
  getBlogComments,
  likeBlogComment,
  unlikeBlogComment,
} from '@/src/api/BlogComments';
import BlogCommentList from '@/src/app/components/comments/BlogCommentList';
import { useRequireAuth } from '@/src/hooks/userRequireAuth';
import { handleApiError } from '@/src/lib/handleApiError';
import { showGlobalToast } from '@/src/lib/toastStore';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  blogId: number;
  initialCommentCount: number;
}

export default function BlogCommentSection({ blogId, initialCommentCount }: Props) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(initialCommentCount);
  const [loading, setLoading] = useState(true);

  const requireAuth = useRequireAuth();

  /** =============================
   *  공통: 최신순 정렬 함수
   * ============================= */
  const sortCommentsOldest = (list: any[]): any[] => {
    const sorted = [...list]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((c) => ({
        ...c,
        children: c.children
          ? [...c.children].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            )
          : [],
      }));

    return sorted;
  };

  /** 트리 전체 댓글 수 계산 */
  const countAllComments = (list: any[]): number => {
    let count = 0;
    for (const c of list) {
      count++;
      if (c.children?.length) count += countAllComments(c.children);
    }
    return count;
  };

  /** =============================
   *  최초 댓글 불러오기 (한 번만)
   * ============================= */
  useEffect(() => {
    const fetch = async () => {
      try {
        let data = await getBlogComments(blogId);
        data = sortCommentsOldest(data);

        setComments(data);
        setTotalCount(countAllComments(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [blogId]);

  /** =============================
   *  최상위 댓글 작성 (Optimistic)
   * ============================= */
  const handleCommentSubmit = async () => {
    if (!requireAuth('댓글 작성')) return;
    if (!commentText.trim()) return showGlobalToast('내용을 입력해주세요.', 'warning');

    const content = commentText.trim();
    setCommentText('');

    try {
      const newComment = await createBlogComment(blogId, content, undefined);

      setComments((prev) => sortCommentsOldest([newComment, ...prev]));
      setTotalCount((prev) => prev + 1);
    } catch (err: any) {
      showGlobalToast(err.message);
    }
  };

  const handleCommentFocus = () => {
    if (!requireAuth('댓글 작성')) {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  /** =============================
   *  대댓글 작성 (Optimistic)
   * ============================= */
  const handleReply = async (parentId: number, replyText: string) => {
    if (!requireAuth('답글 작성')) return;
    if (!replyText.trim()) return showGlobalToast('내용을 입력해주세요.');

    try {
      const newReply = await createBlogComment(blogId, replyText.trim(), parentId);

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                children: sortCommentsOldest([...(c.children ?? []), newReply]),
              }
            : c,
        ),
      );

      setTotalCount((prev) => prev + 1);
    } catch (err: any) {
      handleApiError(err.message);
    }
  };

  /** =============================
   *  좋아요 토글 (Optimistic)
   * ============================= */
  const handleLike = async (commentId: number) => {
    if (!requireAuth('좋아요')) return;

    const target = findComment(commentId);
    if (!target) return;

    const optimisticNext = !target.isLiked;

    updateCommentLikeState(commentId, optimisticNext);

    try {
      optimisticNext ? await likeBlogComment(commentId) : await unlikeBlogComment(commentId);
    } catch (err: any) {
      updateCommentLikeState(commentId, !optimisticNext);
      handleApiError(err);
    }
  };

  const findComment = (id: number): any | null => {
    for (const c of comments) {
      if (c.id === id) return c;
      const child = c.children?.find((cc: any) => cc.id === id);
      if (child) return child;
    }
    return null;
  };

  const updateCommentLikeState = (id: number, isLiked: boolean) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === id) {
          return {
            ...comment,
            isLiked,
            likeCount: isLiked ? comment.likeCount + 1 : comment.likeCount - 1,
          };
        }

        if (comment.children) {
          return {
            ...comment,
            children: comment.children.map((child: any) =>
              child.id === id
                ? {
                    ...child,
                    isLiked,
                    likeCount: isLiked ? child.likeCount + 1 : child.likeCount - 1,
                  }
                : child,
            ),
          };
        }

        return comment;
      }),
    );
  };

  /** =============================
   *  댓글 수정 (Optimistic)
   * ============================= */
  const handleEdit = async (commentId: number, newContent: string) => {
    if (!requireAuth('댓글 수정')) return;

    try {
      const updated = await editBlogComment(commentId, newContent);

      setComments((prev) =>
        sortCommentsOldest(
          prev.map((comment) => {
            if (comment.id === commentId) return updated;
            return {
              ...comment,
              children: comment.children?.map((child: any) =>
                child.id === commentId ? updated : child,
              ),
            };
          }),
        ),
      );
    } catch (err: any) {
      handleApiError(err.message);
    }
  };

  /** =============================
   *  댓글 삭제 (Optimistic)
   * ============================= */
  const handleDelete = async (commentId: number) => {
    if (!requireAuth('댓글 삭제')) return;

    try {
      await deleteBlogComment(commentId);

      setComments((prev) =>
        sortCommentsOldest(
          prev
            .map((comment) => ({
              ...comment,
              children: comment.children?.filter((c: any) => c.id !== commentId) ?? [],
            }))
            .filter((comment) => comment.id !== commentId),
        ),
      );

      setTotalCount((prev) => prev - 1);
    } catch (err: any) {
      handleApiError(err.message);
    }
  };

  /** =============================
   *  렌더
   * ============================= */
  return (
    <section className="border-slate-100 px-3 py-1 sm:px-1">
      {/* 댓글 헤더 */}
      <div className="flex items-center gap-1 mb-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500">
          <MessageCircle className="h-3.5 w-3.5" />
        </div>

        <p className="text-sm font-semibold text-slate-900">
          댓글 <span className="ml-0.5 font-bold text-sky-600">{totalCount}</span>개
        </p>
      </div>

      {/* 입력창 */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-7 sm:px-0.5 sm:py-2">
        <div className="flex items-center gap-2">
          {/* 프로필 자리 (지금은 간단한 플레이스홀더) */}
          {/* <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-600 sm:flex">
            나
          </div> */}

          <input
            type="text"
            className="flex-1 rounded-full bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#2979FF]/40"
            placeholder="따뜻한 댓글을 남겨보세요"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={handleCommentFocus}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCommentSubmit();
              }
            }}
          />
          <button
            onClick={handleCommentSubmit}
            className="shrink-0 rounded-full bg-[#2979FF] px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#1f5ecc] transition-colors"
          >
            등록
          </button>
        </div>
      </div>

      {/* 댓글 리스트 */}
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="py-4 text-center text-xs text-slate-400">댓글을 불러오는 중입니다…</p>
        ) : (
          <BlogCommentList
            comments={comments}
            onReply={handleReply}
            onLike={handleLike}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </section>
  );
}
