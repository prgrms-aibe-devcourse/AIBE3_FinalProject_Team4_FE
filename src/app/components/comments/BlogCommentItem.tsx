'use client';

import { useRequireAuth } from '@/src/hooks/userRequireAuth';
import { showGlobalToast } from '@/src/lib/toastStore';
import { CommentType } from '@/src/types/comment';
import { timeAgo } from '@/src/utils/timeAgo';
import { EllipsisVertical, Heart } from 'lucide-react';
import { useState } from 'react';

interface BlogCommentItemProps {
  comment: CommentType;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');

  const [openReplies, setOpenReplies] = useState(false); // 🔥 답글 접기/펼치기
  const requireAuth = useRequireAuth();

  /** 좋아요 */
  const handleLike = async () => {
    if (!requireAuth('좋아요')) return;
    if (comment.isMine) {
      showGlobalToast('내 댓글에는 좋아요를 누를 수 없습니다.', 'warning');
      return;
    }

    try {
      await onLike(comment.id);
    } catch (err: any) {
      showGlobalToast(err.message, 'warning');
    }
  };

  /** 수정 */
  const handleEditSubmit = async () => {
    if (!editText.trim()) return showGlobalToast('내용을 입력해주세요', 'warning');
    await onEdit(comment.id, editText.trim());
    setEditMode(false);
  };

  /** 삭제 */
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await onDelete(comment.id);
  };

  /** 답글 작성 */
  const handleReplySubmit = async () => {
    if (!requireAuth('댓글 작성')) return;
    if (!replyText.trim()) return showGlobalToast('내용을 입력해주세요.', 'warning');

    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setReplyMode(false);
    setOpenReplies(true); // 🔥 답글 작성 뒤 자동으로 펼치기
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-xs">
      <div className="flex gap-3">
        {/* 프로필 */}
        <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200 flex-shrink-0">
          <img
            src={comment.userProfileImgUrl || '/tmpProfile.png'}
            alt="profile"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative flex-1">
          {/* 닉네임 + 시간 + 메뉴 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">{comment.nickname}</span>
                <span className="text-[11px] text-slate-400">{timeAgo(comment.createdAt)}</span>
              </div>
            </div>

            {comment.isMine && (
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <EllipsisVertical size={16} />
              </button>
            )}
          </div>

          {/* 메뉴 */}
          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 w-28 overflow-hidden rounded-xl border border-slate-100 bg-white text-xs shadow-lg">
              <button
                onClick={() => {
                  setEditMode(true);
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="block w-full px-3 py-2 text-left text-rose-500 hover:bg-rose-50"
              >
                삭제
              </button>
            </div>
          )}

          {/* 내용 / 수정 모드 */}
          {!editMode ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {comment.content}
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2979FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/20"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="flex items-center gap-2 text-xs">
                <button
                  className="rounded-full bg-[#2979FF] px-3 py-1 font-medium text-white hover:bg-[#1f5ecc]"
                  onClick={handleEditSubmit}
                >
                  저장
                </button>
                <button
                  className="rounded-full px-3 py-1 font-medium text-slate-500 hover:bg-slate-100"
                  onClick={() => setEditMode(false)}
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 좋아요 / 답글 */}
          <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
            <button
              onClick={handleLike}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-rose-50 hover:text-rose-500"
            >
              <Heart
                size={14}
                className={comment.isLiked ? 'text-rose-500' : 'text-slate-400'}
                fill={comment.isLiked ? '#f97373' : 'none'}
              />
              <span className="font-medium">{comment.likeCount}</span>
            </button>

            {depth === 0 && (
              <button
                onClick={() => setReplyMode((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-slate-100 hover:text-slate-800"
              >
                <span>답글 달기</span>
              </button>
            )}
          </div>

          {/* 답글 입력창 */}
          {replyMode && (
            <div className="mt-5 ml-3 flex gap-1">
              <input
                className="flex-1 rounded-full bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#2979FF]/40"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답글을 입력해 주세요"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Enter 시 줄바꿈 방지
                    handleReplySubmit();
                  }
                }}
              />
              <button
                className="shrink-0 rounded-full bg-[#2979FF] px-3.5 py-1.0 text-xs font-medium text-white shadow-sm hover:bg-[#1f5ecc] transition-colors"
                onClick={handleReplySubmit}
              >
                등록
              </button>
            </div>
          )}

          {/* 대댓글 접기/펼치기 */}
          {comment.children.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setOpenReplies((prev) => !prev)}
                className="text-[11px] text-slate-500 hover:text-slate-700"
              >
                {openReplies ? '답글 숨기기' : `답글 ${comment.children.length}개 보기`}
              </button>

              {openReplies && (
                <div className="mt-1 space-y-3   pl-4">
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
