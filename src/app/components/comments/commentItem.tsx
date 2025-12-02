'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CommentItemProps {
  comment: any;
  onReply: (parentId: number, text: string) => void;
  onLike: (commentId: number) => void;
}

export default function CommentItem({
  comment,
  onReply,
  onLike,
}: CommentItemProps) {
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const hasChildren = comment.children && comment.children.length > 0;

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText('');
    setReplyMode(false);
    setIsRepliesOpen(true); // 등록 후 자동으로 하위 답글 영역 펼치기
  };

  const toggleReplies = () => {
    setIsRepliesOpen((prev) => !prev);
  };

  return (
    <div className="flex gap-3 py-2">
      {/* 프로필 이미지 */}
      <Image
        src={comment.profileImgUrl || '/default-profile.png'}
        alt="profile"
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover"
      />

      <div className="flex-1">
        {/* 닉네임 + 내용 */}
        <p className="text-xs">
          <span className="mr-1 font-semibold">{comment.nickname}</span>
          {comment.content}
        </p>

        {/* 아래 메타 영역 */}
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => onLike(comment.id)}
            className="flex items-center gap-1"
          >
            <span>❤️</span>
            <span>{comment.likeCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setReplyMode((prev) => !prev)}
            className="hover:underline"
          >
            답글 달기
          </button>

          {hasChildren && (
            <button
              type="button"
              onClick={toggleReplies}
              className="hover:underline text-slate-500"
            >
              {isRepliesOpen
                ? '답글 숨기기'
                : `답글 ${comment.children.length}개 보기`}
            </button>
          )}
        </div>

        {/* 대댓글 입력창 */}
        {replyMode && (
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
              placeholder="답글 입력..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              type="button"
              onClick={handleReplySubmit}
              className="text-xs font-semibold text-[#2979FF]"
            >
              등록
            </button>
          </div>
        )}

        {/* 답글 목록 (접기/펼치기) */}
        {hasChildren && isRepliesOpen && (
          <div className="mt-2 space-y-2 border-l border-slate-100 pl-3">
            {comment.children.map((child: any) => (
              <CommentItem
                key={child.id}
                comment={child}
                onReply={onReply}
                onLike={onLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
