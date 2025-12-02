'use client';

import CommentList from '@/src/app/components/comments/commentList';
import { useEffect, useState } from 'react';
import { requireAuth } from '../../../../lib/auth';

interface Props {
  shorlogId: number;
  initialCommentCount: number; // 필요 없으면 나중에 제거 가능
}

export default function ShorlogCommentSection({ shorlogId }: Props) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 댓글 목록 조회
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/comments/SHORLOG/${shorlogId}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setComments(json.data);
      }
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
      const res = await fetch(`${API_BASE}/api/v1/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'SHORLOG',
          targetId: shorlogId,
          parentId: null,
          content: commentText.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.msg || '댓글 등록 실패');
        return;
      }

      setCommentText('');
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  // 답글 작성 (대댓글)
  const handleReply = async (parentId: number, replyText: string) => {
    if (!(await requireAuth('댓글 답글 작성'))) return;
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'SHORLOG',
          targetId: shorlogId,
          parentId,
          content: replyText.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.msg || '답글 등록 실패');
        return;
      }

      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  // 좋아요 / 좋아요 취소
  const handleLike = async (commentId: number) => {
    if (!(await requireAuth('댓글 좋아요'))) return;

    try {
      const likeRes = await fetch(
        `${API_BASE}/api/v1/comments/${commentId}/like`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!likeRes.ok) {
        const json = await likeRes.json();
        // 이미 좋아요 상태라서 에러 난 경우 → unlike로 토글
        if (json.msg?.includes('이미 좋아요')) {
          await fetch(
            `${API_BASE}/api/v1/comments/${commentId}/unlike`,
            {
              method: 'POST',
              credentials: 'include',
            }
          );
        } else {
          alert(json.msg || '댓글 좋아요 실패');
        }
      }

      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const totalCount = comments.length; // 필요하면 children까지 합산 로직도 가능

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">
        댓글 {totalCount}개
      </p>

      {/* 입력창 */}
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
        {/* TODO: 추후 이모지 버튼 / 프로필 등 추가 가능 */}
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
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
          />
        )}
      </div>
    </div>
  );
}
