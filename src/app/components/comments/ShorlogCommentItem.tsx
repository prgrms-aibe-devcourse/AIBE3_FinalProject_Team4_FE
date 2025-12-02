'use client';

import { requireAuth } from '@/src/lib/auth';
import { timeAgo } from '@/src/utils/timeAgo';
import { Heart, MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CommentType } from '../../../types/comment';

interface CommentItemProps {
  comment: CommentType;
  onLike: (id: number) => Promise<void>;
  onReply: (parentId: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (commentId: number, newContent: string) => Promise<void>;
  depth?: number;
}

export default function CommentItem({
  comment,
  onLike,
  onReply,
  onDelete,
  onEdit,
  depth = 0,
}: CommentItemProps) {
  const [liked, setLiked] = useState(comment.isLiked);            // ✔ isLiked 기준
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [openReplies, setOpenReplies] = useState(false);

  // 서버에서 최신 데이터 오면 내부 상태 업데이트
  useEffect(() => {
    setLiked(comment.isLiked);
    setLikeCount(comment.likeCount);
  }, [comment.isLiked, comment.likeCount]);

  /** 좋아요 처리 */
  const handleLike = async () => {
    if (!(await requireAuth('좋아요'))) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    try {
      await onLike(comment.id);
    } catch {
      // 실패 시 롤백
      setLiked(!nextLiked);
      setLikeCount((prev) => (nextLiked ? prev - 1 : prev + 1));
    }
  };

  /** 답글 작성 */
  const handleReplySubmit = async () => {
    if (!(await requireAuth('댓글 작성'))) return;
    if (!replyText.trim()) return alert('내용을 입력해주세요.');

    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setReplyMode(false);
  };

  /** 댓글 삭제 */
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await onDelete(comment.id);
  };

  /** 댓글 수정 */
  const handleEditSubmit = async () => {
    if (!editText.trim()) return alert('내용을 입력해주세요.');

    await onEdit(comment.id, editText);
    setEditMode(false);
  };

  return (
    <div className="py-4 border-b flex gap-3">

      {/* 프로필 이미지 */}
      <img
        src={comment.userProfileImgUrl || '/tmpProfile.png'}
        alt="프로필"
        className="h-8 w-8 rounded-full object-cover"
      />

      <div className="flex-1 relative"> {/* 메뉴 absolute 기준 */}
        
        {/* 상단: 닉네임 + 시간 + 메뉴 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{comment.nickname}</span>
            <span className="text-[11px] text-slate-400">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* 본인 댓글만 수정/삭제 메뉴 */}
          {comment.isMine && (
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1 text-slate-500 hover:text-slate-700"
            >
              <MoreHorizontal size={16} />
            </button>
          )}
        </div>

        {/* 메뉴 — 위치 오류 해결 */}
        {menuOpen && (
          <div className="absolute right-0 top-6 bg-white border rounded-md shadow px-3 py-2 text-sm z-10">
            <button
              onClick={() => {
                setEditMode(true);
                setMenuOpen(false);
              }}
              className="block w-full text-left py-1 hover:text-blue-600"
            >
              수정하기
            </button>

            <button
              onClick={handleDelete}
              className="block w-full text-left py-1 text-red-500 hover:text-red-600"
            >
              삭제하기
            </button>
          </div>
        )}

        {/* 내용 or 수정폼 */}
        {!editMode ? (
          <p className="text-sm whitespace-pre-line">{comment.content}</p>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 rounded border px-2 text-sm"
            />
            <button className="text-blue-600 text-sm" onClick={handleEditSubmit}>
              저장
            </button>
            <button
              className="text-slate-500 text-sm"
              onClick={() => setEditMode(false)}
            >
              취소
            </button>
          </div>
        )}

        {/* 좋아요 + 답글 */}
        <div className="flex items-center gap-3 mt-1">
          {/* 좋아요 */}
          <button
            type="button"
            onClick={handleLike}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition"
            aria-label={liked ? '좋아요 취소' : '좋아요'}
          >
            <Heart
              className={`h-5 w-5 transition-transform ${
                liked ? 'scale-110 text-rose-500' : 'text-slate-700'
              }`}
              fill={liked ? '#f97373' : 'none'}
            />
            <span className="text-[13px] font-medium">{likeCount}</span>
          </button>

          {depth === 0 && (
            <button
                onClick={() => setReplyMode(prev => !prev)}
                className="text-xs text-slate-600 hover:text-slate-900"
            >
                답글 달기
            </button>
            )}
        </div>

        {/* 답글 input */}
        {replyMode && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="답글 입력..."
            />
            <button
              onClick={handleReplySubmit}
              className="text-sm text-blue-600 font-semibold"
            >
              등록
            </button>
          </div>
        )}

        {/* 대댓글(1단계만 허용) */}
        {comment.children.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setOpenReplies((prev) => !prev)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              {openReplies
                ? '답글 숨기기'
                : `답글 ${comment.children.length}개 보기`}
            </button>

            {openReplies && (
              <div className="mt-2 ml-4 border-l pl-3 space-y-3">
                {comment.children.map((child) => (
                  <CommentItem
                    key={child.id}
                    comment={child}
                    onLike={onLike}
                    onReply={onReply}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    depth={depth + 1} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
