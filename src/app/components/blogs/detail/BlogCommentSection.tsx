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
  const sortCommentsLatest = (list: any[]): any[] => {
    const sorted = [...list]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((c) => ({
        ...c,
        children: c.children
          ? [...c.children].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
        data = sortCommentsLatest(data);

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
    if (!commentText.trim()) return alert('댓글을 입력해주세요.');

    const content = commentText.trim();
    setCommentText('');

    try {
      const newComment = await createBlogComment(blogId, content, undefined);

      setComments((prev) => sortCommentsLatest([newComment, ...prev]));
      setTotalCount((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message);
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
    if (!replyText.trim()) return alert('내용을 입력해주세요.');

    try {
      const newReply = await createBlogComment(blogId, replyText.trim(), parentId);

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                children: sortCommentsLatest([...(c.children ?? []), newReply]),
              }
            : c,
        ),
      );

      setTotalCount((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message);
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
      alert(err.message);
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
        sortCommentsLatest(
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
      alert(err.message);
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
        sortCommentsLatest(
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
      alert(err.message);
    }
  };

  /** =============================
   *  렌더
   * ============================= */
  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-semibold text-slate-700">댓글 {totalCount}개</p>

      {/* 입력창 */}
      <div className="flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2">
        <input
          type="text"
          className="flex-1 bg-transparent text-sm outline-none"
          placeholder="댓글을 입력하세요..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onFocus={handleCommentFocus}
        />
        <button
          onClick={handleCommentSubmit}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          등록
        </button>
      </div>

      {/* 댓글 리스트 */}
      <div className="mt-4">
        {loading ? (
          <p className="text-xs text-slate-400">불러오는 중...</p>
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
    </div>
  );
}
