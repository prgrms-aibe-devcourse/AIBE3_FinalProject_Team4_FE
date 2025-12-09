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
import { useRequireAuth } from '@/src/hooks/userRequireAuth';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
  shorlogId: number;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
}

export default function ShorlogCommentSection({
  shorlogId,
  initialCommentCount,
  onCommentCountChange,
}: Props) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const requireAuth = useRequireAuth();
  const searchParams = useSearchParams();

  // URL query: /shorlog/13?commentId=77
  const highlightCommentId = searchParams.get('commentId')
    ? Number(searchParams.get('commentId'))
    : null;

  // 최신순 정렬
  const sortCommentsLatest = (list: any[]): any[] => {
    return [...list]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((c) => ({
        ...c,
        children: c.children
          ? [...c.children].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
          : [],
      }));
  };

  // 자동 펼침 및 하이라이트 적용
  const applyHighlightAndExpand = (list: any[], targetId: number): any[] => {
    const clone = JSON.parse(JSON.stringify(list));

    const walk = (items: any[]): boolean => {
      for (const item of items) {
        if (item.id === targetId) {
          item._highlight = true;
          item._forceOpen = true;
          return true;
        }

        if (item.children?.length) {
          const found = walk(item.children);
          if (found) {
            item._forceOpen = true;
            return true;
          }
        }
      }
      return false;
    };

    walk(clone);
    return clone;
  };

  // 댓글 불러오기
  const fetchComments = async () => {
    setLoading(true);

    try {
      let data = await getComments(shorlogId);
      data = sortCommentsLatest(data);

      if (highlightCommentId) {
        data = applyHighlightAndExpand(data, highlightCommentId);
      }

      setComments(data);

      // 스크롤 이동
      if (highlightCommentId) {
        setTimeout(() => {
          const el = document.getElementById(`comment-${highlightCommentId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-yellow-100');
            setTimeout(() => el.classList.remove('bg-yellow-100'), 1800);
          }
        }, 300);
      }
    } catch (err) {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [shorlogId, highlightCommentId]);

  // 전체 댓글 count 계산
  const countAllComments = (list: any[]): number => {
    let count = 0;
    for (const c of list) {
      count += 1;
      if (c.children?.length) count += countAllComments(c.children);
    }
    return count;
  };

  // 부모에게 댓글 수 전달
  useEffect(() => {
    onCommentCountChange?.(countAllComments(comments));
  }, [comments, onCommentCountChange]);

  // 댓글 입력창 포커스
  const handleCommentFocus = async () => {
    if (!requireAuth('댓글 작성')) {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  // 최상위 댓글 작성
  const handleCommentSubmit = async () => {
    if (!requireAuth('댓글 작성')) return;
    if (!commentText.trim()) return showGlobalToast('댓글 내용을 입력해주세요.', 'warning');

    try {
      await createComment(shorlogId, commentText.trim(), undefined);
      setCommentText('');
      await fetchComments();
      showGlobalToast('댓글이 등록되었습니다.', 'success');
    } catch (err: any) {
      showGlobalToast(err.message || '댓글 등록 실패', 'error');
    }
  };

  // 대댓글 작성
  const handleReply = async (parentId: number, replyText: string) => {
    if (!requireAuth('댓글 답글 작성')) return;
    if (!replyText.trim()) return;

    try {
      await createComment(shorlogId, replyText.trim(), parentId);
      await fetchComments();
      showGlobalToast('답글이 등록되었습니다.', 'success');
    } catch (err: any) {
      showGlobalToast(err.message || '답글 등록 실패', 'error');
    }
  };

  // 좋아요 처리
  const handleLike = async (commentId: number) => {
    if (!requireAuth('댓글 좋아요')) return;

    const target = findComment(commentId);
    if (!target) return;

    const nextLiked = !target.isLiked;
    updateCommentLikeState(commentId, nextLiked);

    try {
      nextLiked ? await likeComment(commentId) : await unlikeComment(commentId);
    } catch (err: any) {
      updateCommentLikeState(commentId, !nextLiked);
      showGlobalToast(err.message || '좋아요 실패', 'error');
    }
  };

  // 특정 댓글 찾기
  const findComment = (commentId: number) => {
    for (const c of comments) {
      if (c.id === commentId) return c;
      const child = c.children?.find((x: any) => x.id === commentId);
      if (child) return child;
    }
    return null;
  };

  // 좋아요 UI 업데이트
  const updateCommentLikeState = (id: number, isLiked: boolean) => {
    setComments((prev) =>
      sortCommentsLatest(
        prev.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              isLiked,
              likeCount: isLiked ? c.likeCount + 1 : c.likeCount - 1,
            };
          }
          return {
            ...c,
            children: c.children?.map((child: any) =>
              child.id === id
                ? {
                    ...child,
                    isLiked,
                    likeCount: isLiked ? child.likeCount + 1 : child.likeCount - 1,
                  }
                : child,
            ),
          };
        }),
      ),
    );
  };

  // 댓글 수정
  const handleEdit = async (commentId: number, newContent: string) => {
    if (!requireAuth('댓글 수정')) return;

    try {
      await editComment(commentId, newContent);
      await fetchComments();
      showGlobalToast('댓글이 수정되었습니다.', 'success');
    } catch (err: any) {
      showGlobalToast(err.message || '댓글 수정 실패', 'error');
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId: number) => {
    if (!requireAuth('댓글 삭제')) return;

    try {
      await deleteComment(commentId);
      await fetchComments();
      showGlobalToast('댓글이 삭제되었습니다.', 'success');
    } catch (err: any) {
      showGlobalToast(err.message || '댓글 삭제 실패', 'error');
    }
  };

  const totalCount = countAllComments(comments) || initialCommentCount || 0;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">댓글 {totalCount}개</p>

      {/* 입력창 */}
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onFocus={handleCommentFocus}
          placeholder="댓글 달기..."
          className="flex-1 border-none bg-transparent text-xs outline-none placeholder:text-slate-400"
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
