'use client';

import { useRequireAuth } from '@/src/hooks/userRequireAuth';
import { timeAgo } from '@/src/utils/timeAgo';
import { EllipsisVertical, Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CommentType } from '../../../types/comment';

interface CommentItemProps {
  comment: CommentType & {
    _highlight?: boolean;
    _forceOpen?: boolean;
  };
  onLike: (id: number) => Promise<void>;
  onReply: (parentId: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (commentId: number, newContent: string) => Promise<void>;
  depth?: number;
}

export default function ShorlogCommentItem({
  comment,
  onLike,
  onReply,
  onDelete,
  onEdit,
  depth = 0,
}: CommentItemProps) {
  const requireAuth = useRequireAuth();

  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const [openReplies, setOpenReplies] = useState(comment._forceOpen || false);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (comment._highlight && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

      ref.current.classList.add('bg-yellow-100', 'transition');

      setTimeout(() => {
        ref.current?.classList.remove('bg-yellow-100');
      }, 1800);
    }
  }, [comment._highlight]);

  /** 좋아요 */
  const handleLike = async () => {
    if (!requireAuth('좋아요')) return;

    if (comment.isMine) return alert('내 댓글에는 좋아요를 누를 수 없습니다.');

    await onLike(comment.id);
  };

  /** 답글 */
  const handleReplySubmit = async () => {
    if (!requireAuth('댓글 작성')) return;
    if (!replyText.trim()) return alert('내용을 입력해주세요.');

    await onReply(comment.id, replyText.trim());
    setReplyMode(false);
    setReplyText('');

    // 답글 작성 시 자동 펼침
    setOpenReplies(true);
  };

  /** 수정 */
  const handleEditSubmit = async () => {
    if (!editText.trim()) return alert('내용을 입력해주세요.');

    await onEdit(comment.id, editText.trim());
    setEditMode(false);
  };

  /** 삭제 */
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await onDelete(comment.id);
  };

  return (
    <div
      ref={ref}
      className={`
        py-4 border-b flex gap-3 transition 
        ${comment._highlight ? 'bg-yellow-50 border-yellow-300' : ''}
      `}
    >
      {/* 프로필 */}
      <img
        src={comment.userProfileImgUrl || '/tmpProfile.png'}
        alt="프로필"
        className="h-8 w-8 rounded-full object-cover"
      />

      <div className="flex-1 relative">
        {/* 상단: 작성자 / 시간 / 메뉴 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{comment.nickname}</span>
            <span className="text-[11px] text-slate-400">{timeAgo(comment.createdAt)}</span>
          </div>

          {comment.isMine && (
            <button
              className="p-1 text-slate-500 hover:text-slate-700"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <EllipsisVertical size={16} />
            </button>
          )}
        </div>

        {/* 메뉴 */}
        {menuOpen && (
          <div className="absolute right-0 top-6 w-28 bg-white shadow border rounded-md text-sm z-10">
            <button
              onClick={() => {
                setEditMode(true);
                setMenuOpen(false);
              }}
              className="w-full text-left px-3 py-1 hover:bg-slate-50"
            >
              수정하기
            </button>

            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-1 text-red-500 hover:bg-red-50"
            >
              삭제하기
            </button>
          </div>
        )}

        {/* 내용 or 수정 */}
        {!editMode ? (
          <p className="text-sm whitespace-pre-line mt-1">{comment.content}</p>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 border rounded px-2 text-sm"
            />
            <button onClick={handleEditSubmit} className="text-blue-600 text-sm">
              저장
            </button>
            <button className="text-slate-500 text-sm" onClick={() => setEditMode(false)}>
              취소
            </button>
          </div>
        )}

        {/* 좋아요 + 답글 */}
        <div className="flex items-center gap-3 mt-2 text-xs">
          <button onClick={handleLike} className="flex items-center gap-1.5">
            <Heart
              size={15}
              className={comment.isLiked ? 'text-rose-500' : 'text-slate-700'}
              fill={comment.isLiked ? '#f97373' : 'none'}
            />
            {comment.likeCount}
          </button>

          {depth === 0 && (
            <button
              onClick={() => setReplyMode((prev) => !prev)}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              답글 달기
            </button>
          )}
        </div>

        {/* 답글 입력 */}
        {replyMode && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="답글 입력..."
            />
            <button onClick={handleReplySubmit} className="text-blue-600 text-sm font-semibold">
              등록
            </button>
          </div>
        )}

        {/* 대댓글 */}
        {comment.children.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setOpenReplies((prev) => !prev)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              {openReplies ? '답글 숨기기' : `답글 ${comment.children.length}개 보기`}
            </button>

            {openReplies && (
              <div className="mt-2 ml-4 border-l pl-3 space-y-3">
                {comment.children.map((child) => (
                  <ShorlogCommentItem
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
