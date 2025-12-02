'use client';

import {
  createComment,
  deleteComment,
  editComment,
  getComments,
  likeComment,
  unlikeComment,
} from '@/src/api/ShorlogComments'; // ← API 함수들
import CommentList from '@/src/app/components/comments/ShorlogCommentList';
import { requireAuth } from '@/src/lib/auth';
import { useEffect, useState } from 'react';

interface Props {
  shorlogId: number;
}

export default function ShorlogCommentSection({ shorlogId }: Props) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 댓글 목록 불러오기
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

  // 최상위 댓글 작성
  const handleCommentSubmit = async () => {
    if (!(await requireAuth('댓글 작성'))) return;
    if (!commentText.trim()) return alert('댓글 내용을 입력해주세요.');

    try {
      await createComment(shorlogId, commentText.trim(), undefined);
      setCommentText('');
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 대댓글 작성
  const handleReply = async (parentId: number, replyText: string) => {
    if (!(await requireAuth('댓글 답글 작성'))) return;
    if (!replyText.trim()) return;

    try {
      await createComment(shorlogId, replyText.trim(), parentId);
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 좋아요 / 좋아요 취소
const handleLike = async (commentId: number) => {
  if (!(await requireAuth('댓글 좋아요'))) return;

  const target = comments.find(c => c.id === commentId);
  if (!target) return;

  const nextLiked = !target.isLiked;

  // 낙관적 업데이트
  updateCommentLikeState(commentId, nextLiked);

  try {
    if (nextLiked) {
      await likeComment(commentId);
    } else {
      await unlikeComment(commentId);
    }
  } catch (err) {
    // 실패 시 롤백
    updateCommentLikeState(commentId, !nextLiked);
  }
};

// 특정 댓글만 상태 업데이트
const updateCommentLikeState = (id: number, isLiked: boolean) => {
  setComments(prev =>
    prev.map(comment =>
      comment.id === id
        ? { ...comment, isLiked, likeCount: isLiked ? comment.likeCount + 1 : comment.likeCount - 1 }
        : comment
    )
  );
};


  // 댓글 수정
  const handleEdit = async (commentId: number, newContent: string) => {
    if (!(await requireAuth('댓글 수정'))) return;

    try {
      await editComment(commentId, newContent);
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId: number) => {
    if (!(await requireAuth('댓글 삭제'))) return;

    try {
      await deleteComment(commentId);
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalCount = comments.length; // 필요하면 children 포함 계산 가능

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">
        댓글 {totalCount}개
      </p>

      {/* 댓글 입력창 */}
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="댓글 달기..."
          className="flex-1 border-none bg-transparent text-xs outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={handleCommentSubmit}
          className="text-xs font-semibold text-[#2979FF] hover:text-[#1863db]"
        >
          등록
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
