'use client';

import {
  createComment,
  deleteComment,
  editComment,
  getComments,
  likeComment,
  unlikeComment,
} from '@/src/api/ShorlogComments';
import CommentList from '@/src/app/components/comments/ShorlogCommentList';
import { requireAuth } from '@/src/lib/auth';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useEffect, useState } from 'react';

interface Props {
  shorlogId: number;
  initialCommentCount?: number;
}

export default function ShorlogCommentSection({ shorlogId, initialCommentCount }: Props) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /** 댓글 목록 불러오기 */
  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(shorlogId);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [shorlogId]);

  /** 댓글 입력창 포커스 */
  const handleCommentFocus = async () => {
    if (!(await requireAuth('댓글 작성'))) {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  /** 최상위 댓글 작성 */
  const handleCommentSubmit = async () => {
    if (!(await requireAuth('댓글 작성'))) return;
    
    if (!commentText.trim()) {
      showGlobalToast('댓글 내용을 입력해주세요.', 'warning');
      return;
    }

    try {
      await createComment(shorlogId, commentText.trim(), undefined);
      setCommentText('');
      await fetchComments();
      showGlobalToast('댓글이 등록되었습니다.', 'success');
    } catch (err: any) {
      showGlobalToast(err.message || '댓글 등록에 실패했습니다.', 'error');
    }
  };

  /** 대댓글 작성 */
  const handleReply = async (parentId: number, replyText: string) => {
    if (!(await requireAuth('댓글 답글 작성'))) return;
    if (!replyText.trim()) return;

    try {
      await createComment(shorlogId, replyText.trim(), parentId);
      await fetchComments();
      showGlobalToast('답글이 등록되었습니다.', 'success');
    } catch (err: any) {
      showGlobalToast(err.message || '답글 등록에 실패했습니다.', 'error');
    }
  };

  /** 좋아요 / 취소 */
  const handleLike = async (commentId: number) => {
    if (!(await requireAuth('댓글 좋아요'))) return;

    const target = findComment(commentId);
    if (!target) return;

    const nextLiked = !target.isLiked;

    // UI 낙관적 업데이트
    updateCommentLikeState(commentId, nextLiked);

    try {
      if (nextLiked) {
        await likeComment(commentId);
      } else {
        await unlikeComment(commentId);
      }
    } catch (err: any) {
      // 실패 → 롤백
      updateCommentLikeState(commentId, !nextLiked);
      showGlobalToast(err.message || '좋아요 처리 중 오류가 발생했습니다.', 'error');
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
      await editComment(commentId, newContent);
      await fetchComments();
      showGlobalToast('댓글이 수정되었습니다.', 'success');
    } catch (err: any) {
      showGlobalToast(err.message || '댓글 수정에 실패했습니다.', 'error');
    }
  };

  /** 댓글 삭제 */
  const handleDelete = async (commentId: number) => {
    if (!(await requireAuth('댓글 삭제'))) return;

    try {
      await deleteComment(commentId);
      await fetchComments();
      showGlobalToast('댓글이 삭제되었습니다.', 'success');
    } catch (err: any) {
      showGlobalToast(err.message || '댓글 삭제에 실패했습니다.', 'error');
    }
  };

  const totalCount = comments.length || initialCommentCount || 0;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">
        댓글 {totalCount}개
      </p>

      {/* 댓글 입력창 */}
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-lg">😊</span>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onFocus={handleCommentFocus}
          placeholder="댓글 달기..."
          className="flex-1 border-none bg-transparent text-xs outline-none placeholder:text-slate-400"
          aria-label="댓글 입력"
        />
        <button
          type="button"
          onClick={handleCommentSubmit}
          className="text-xs font-semibold text-[#2979FF] hover:text-[#1863db]"
        >
          게시
        </button>
      </div>

      {/* 댓글 리스트 */}
      <div className="mt-3">
        {loading ? (
          <p className="text-xs text-slate-400">댓글 불러오는 중...</p>
        ) : (
          <CommentList
            comments={comments}
            onReply={handleReply}
            onLike={handleLike}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}