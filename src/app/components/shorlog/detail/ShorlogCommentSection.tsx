'use client';

import { useState } from 'react';
import { requireAuth } from '../../../../lib/auth';
import { showGlobalToast } from '@/src/lib/toastStore';

interface Props {
  shorlogId: number;
  initialCommentCount: number;
}

export default function ShorlogCommentSection({ shorlogId, initialCommentCount }: Props) {
  const [commentText, setCommentText] = useState('');

  // TODO: 4번(이해민) 댓글 API 연동 필요
  const comments: any[] = [];
  const totalCount = initialCommentCount;

  const handleCommentFocus = () => {
    if (!requireAuth('댓글 작성')) {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const handleCommentSubmit = () => {
    if (!requireAuth('댓글 작성')) return;
    if (!commentText.trim()) {
      showGlobalToast('댓글 내용을 입력해주세요.', 'warning');
      return;
    }
    // TODO: 댓글 등록 API 호출
    showGlobalToast('댓글 등록 기능은 추후 제공될 예정입니다.', 'warning');
    setCommentText('');
  };

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">
        댓글 {totalCount}개
      </p>

      {/* 입력창 */}
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

      {/* TODO: 4번(이해민) 댓글 컴포넌트로 교체 필요 */}
      <p className="mt-3 text-xs text-slate-400">
        댓글 기능은 4번 팀원의 댓글 컴포넌트 완성 후 연동 예정입니다.
      </p>
    </div>
  );
}
