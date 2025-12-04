'use client';

import { useRequireAuth } from '@/src/hooks/userRequireAuth';
import { CommentType } from '@/src/types/comment';
import { timeAgo } from '@/src/utils/timeAgo';
import { Heart, MoreHorizontal } from 'lucide-react';
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
      alert('내 댓글에는 좋아요를 누를 수 없습니다.');
      return;
    }

    try {
      await onLike(comment.id);
    } catch (err: any) {
      alert(err.message || '좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  /** 수정 */
  const handleEditSubmit = async () => {
    if (!editText.trim()) return alert('내용을 입력해주세요');
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
    if (!replyText.trim()) return alert('내용을 입력해주세요.');

    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setReplyMode(false);
    setOpenReplies(true); // 🔥 답글 작성 뒤 자동으로 펼치기
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        {/* 프로필 */}
        <img
          src={comment.userProfileImgUrl || '/tmpProfile.png'}
          alt="profile"
          className="h-10 w-10 rounded-full object-cover"
        />

        <div className="flex-1 relative">
          {/* 닉네임 + 시간 + 메뉴 */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold">{comment.nickname}</span>
              <span className="ml-2 text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
            </div>

            {comment.isMine && (
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-1 hover:text-slate-700"
              >
                <MoreHorizontal size={18} />
              </button>
            )}
          </div>

          {/* 메뉴 */}
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-24 rounded-md border bg-white shadow">
              <button
                onClick={() => {
                  setEditMode(true);
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="block w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          )}

          {/* 내용 or 수정 모드 */}
          {!editMode ? (
            <p className="mt-1 whitespace-pre-line text-sm">{comment.content}</p>
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded border px-2 py-1 text-sm"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <button className="text-sm text-blue-600" onClick={handleEditSubmit}>
                저장
              </button>
              <button className="text-sm text-slate-500" onClick={() => setEditMode(false)}>
                취소
              </button>
            </div>
          )}

          {/* 좋아요 / 답글 */}
          <div className="mt-3 flex items-center gap-5 text-xs text-slate-500">
            <button onClick={handleLike} className="flex items-center gap-1">
              <Heart
                size={15}
                className={comment.isLiked ? 'text-rose-500' : ''}
                fill={comment.isLiked ? '#f87171' : 'none'}
              />
              <span>{comment.likeCount}</span>
            </button>

            {/* depth 0 댓글에만 답글 */}
            {depth === 0 && (
              <button
                onClick={() => setReplyMode((prev) => !prev)}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                답글 달기
              </button>
            )}
          </div>

          {/* 답글 입력창 */}
          {replyMode && (
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded border px-2 py-1 text-sm"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답글 입력..."
              />
              <button className="text-sm text-blue-600" onClick={handleReplySubmit}>
                등록
              </button>
            </div>
          )}

          {/* 🔥 대댓글 접기/펼치기 기능 */}
          {comment.children.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setOpenReplies((prev) => !prev)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                {openReplies ? '답글 숨기기' : `답글 ${comment.children.length}개 보기`}
              </button>

              {openReplies && (
                <div className="mt-3 ml-6 border-l pl-4 space-y-4">
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
