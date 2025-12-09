'use client';

import { useRequireAuth } from '@/src/hooks/userRequireAuth';
import { showGlobalToast } from '@/src/lib/toastStore';
import { CommentType } from '@/src/types/comment';
import { timeAgo } from '@/src/utils/timeAgo';
import { EllipsisVertical, Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BlogCommentItemProps {
  comment: CommentType & {
    _highlight?: boolean;
    _forceOpen?: boolean;
  };
  onReply: (parentId: number, content: string) => Promise<void>;
  onLike: (commentId: number) => Promise<void>;
  onEdit: (commentId: number, newContent: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  depth?: number;
}

export default function BlogCommentItem({
  comment,
  onReply,
  onLike,
  onEdit,
  onDelete,
  depth = 0,
}: BlogCommentItemProps) {
  const requireAuth = useRequireAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');

  const [openReplies, setOpenReplies] = useState(comment._forceOpen ?? false);

  useEffect(() => {
    if (comment._forceOpen) {
      setOpenReplies(true);
    }
  }, [comment._forceOpen]);

  /** 댓글 DOM 참조 */
  const ref = useRef<HTMLDivElement>(null);

  /** 자동 스크롤 + 하이라이트 효과 */
  useEffect(() => {
    if (comment._highlight && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

      ref.current.classList.add('bg-yellow-100');
      setTimeout(() => {
        ref.current?.classList.remove('bg-yellow-100');
      }, 1800);
    }
  }, [comment._highlight]);

  /** 좋아요 */
  const handleLike = async () => {
    if (!requireAuth('좋아요')) return;
    if (comment.isMine) return showGlobalToast('내 댓글은 좋아요 불가', 'warning');
    await onLike(comment.id);
  };

  /** ↩답글 작성 */
  const handleReplySubmit = async () => {
    if (!replyText.trim()) return showGlobalToast('내용을 입력해주세요.');
    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setReplyMode(false);
    setOpenReplies(true); // 답글 작성 후 자동 펼침
  };

  /** 수정 */
  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    await onEdit(comment.id, editText.trim());
    setEditMode(false);
  };

  /** 🗑 삭제 */
  const handleDelete = async () => {
    if (!confirm('삭제하시겠습니까?')) return;
    await onDelete(comment.id);
  };

  return (
    <div
      ref={ref}
      id={`comment-${comment.id}`}
      className={`
        rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition
        ${comment._highlight ? 'bg-yellow-100' : ''}
      `}
    >
      <div className="flex gap-3">
        {/* 프로필 */}
        <img
          src={comment.userProfileImgUrl || '/tmpProfile.png'}
          alt="profile"
          className="w-9 h-9 rounded-full object-cover"
        />

        <div className="flex-1 relative">
          {/* 상단 우측 메뉴 */}
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{comment.nickname}</span>
              <span className="text-[11px] text-slate-400">{timeAgo(comment.createdAt)}</span>
            </div>

            {comment.isMine && (
              <button
                className="p-1 rounded-full hover:bg-slate-100"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <EllipsisVertical size={16} />
              </button>
            )}
          </div>

          {menuOpen && (
            <div className="absolute right-0 top-6 w-28 rounded-md border bg-white shadow-lg text-xs z-10">
              <button
                className="block w-full px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  setEditMode(true);
                  setMenuOpen(false);
                }}
              >
                수정
              </button>
              <button
                className="block w-full px-3 py-2 text-red-500 hover:bg-red-50"
                onClick={handleDelete}
              >
                삭제
              </button>
            </div>
          )}

          {/* 댓글 내용 */}
          {!editMode ? (
            <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
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
            </div>
          )}

          {/* 좋아요 + 답글 */}
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
            <button className="flex items-center gap-1" onClick={handleLike}>
              <Heart
                size={14}
                fill={comment.isLiked ? '#f97373' : 'none'}
                className={comment.isLiked ? 'text-rose-500' : 'text-slate-400'}
              />
              {comment.likeCount}
            </button>

            {depth === 0 && (
              <button onClick={() => setReplyMode((prev) => !prev)}>답글 달기</button>
            )}
          </div>

          {/* 답글 입력 */}
          {replyMode && (
            <div className="mt-3 flex gap-2">
              <input
                className="border rounded px-2 flex-1"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답글 입력…"
              />
              <button onClick={handleReplySubmit} className="text-blue-600 text-sm font-semibold">
                등록
              </button>
            </div>
          )}

          {/* 대댓글 렌더링 */}
          {comment.children?.length > 0 && (
            <div className="mt-2">
              <button
                className="text-xs text-slate-500"
                onClick={() => setOpenReplies((prev) => !prev)}
              >
                {openReplies ? '답글 숨기기' : `답글 ${comment.children.length}개 보기`}
              </button>

              {openReplies && (
                <div className="mt-2 pl-4 border-l space-y-3">
                  {comment.children.map((child) => (
                    <BlogCommentItem
                      key={child.id}
                      comment={child}
                      onReply={onReply}
                      onLike={onLike}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
