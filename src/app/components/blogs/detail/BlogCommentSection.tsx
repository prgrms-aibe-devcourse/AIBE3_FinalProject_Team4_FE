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
import { requireAuth } from '@/src/lib/auth';
import { useEffect, useState } from 'react';

interface Props {
  blogId: number;
}

export default function BlogCommentSection({ blogId }: Props) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /** 댓글 불러오기 */
  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getBlogComments(blogId);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  /** 최상위 댓글 작성 */
  const handleCommentSubmit = async () => {
    if (!(await requireAuth('댓글 작성'))) return;
    if (!commentText.trim()) return alert('댓글을 입력해주세요.');

    try {
      await createBlogComment(blogId, commentText.trim(), undefined);
      setCommentText('');
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  /** 대댓글 작성 */
  const handleReply = async (parentId: number, replyText: string) => {
    if (!(await requireAuth('답글 작성'))) return;
    if (!replyText.trim()) return alert('내용을 입력해주세요.');

    try {
      await createBlogComment(blogId, replyText.trim(), parentId);
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  /** 좋아요 / 취소 */
  const handleLike = async (commentId: number) => {
    if (!(await requireAuth('좋아요'))) return;

    const target = findComment(commentId);
    if (!target) return;

    const nextLiked = !target.isLiked;

    // UI 낙관적 업데이트
    updateCommentLikeState(commentId, nextLiked);

    try {
      if (nextLiked) {
        await likeBlogComment(commentId);
      } else {
        await unlikeBlogComment(commentId);
      }
    } catch (err: any) {
      // 실패 → 롤백
      updateCommentLikeState(commentId, !nextLiked);
      alert(err.message || '좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  /** 댓글 찾기 (최상위 + 대댓글) */
  const findComment = (commentId: number) => {
    for (const comment of comments) {
      if (comment.id === commentId) return comment;
      if (comment.children) {
        const child = comment.children.find((c: any) => c.id === commentId);
        if (child) return child;
      }
    }
    return null;
  };

  /** 특정 댓글만 UI 갱신 (대댓글 포함) */
  const updateCommentLikeState = (id: number, isLiked: boolean) => {
    setComments((prev) =>
      prev.map((comment) => {
        // 최상위 댓글인 경우
        if (comment.id === id) {
          return {
            ...comment,
            isLiked,
            likeCount: isLiked ? comment.likeCount + 1 : comment.likeCount - 1,
          };
        }

        // 대댓글인 경우
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
                : child
            ),
          };
        }

        return comment;
      })
    );
  };

  /** 댓글 수정 */
  const handleEdit = async (commentId: number, newContent: string) => {
    if (!(await requireAuth('댓글 수정'))) return;

    try {
      await editBlogComment(commentId, newContent);
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  /** 댓글 삭제 */
  const handleDelete = async (commentId: number) => {
    if (!(await requireAuth('댓글 삭제'))) return;

    try {
      await deleteBlogComment(commentId);
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-semibold text-slate-700">
        댓글 {comments.length}개
      </p>

      {/* 댓글 입력창 */}
      <div className="flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2">
        <input
          type="text"
          className="flex-1 bg-transparent text-sm outline-none"
          placeholder="댓글을 입력하세요..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
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