'use client';

import { useState } from 'react';
import { requireAuth } from '../../../../lib/auth';

interface Props {
  shorlogId: number;
  initialCommentCount: number;
}

type Comment = {
  id: number;
  author: string;
  avatarText: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
};

const mockCommentsByShorlogId: Record<number, Comment[]> = {
  1: [
    {
      id: 1,
      author: 'catlover',
      avatarText: 'C',
      content: '우리 집 고양이도 새벽 3시에 꼭 한 번씩 스프린트 뛰어요 😂',
      createdAt: '1시간 전',
      replies: [
        {
          id: 11,
          author: 'karpas762',
          avatarText: 'K',
          content: '진짜 전세계 공통 고양이 타임인 것 같아요 ㅎㅎ',
          createdAt: '45분 전',
        },
      ],
    },
    {
      id: 2,
      author: 'nightowl',
      avatarText: 'N',
      content: '야간 질주 끝나고 바로 골골송 부르면 더 귀엽죠.',
      createdAt: '30분 전',
    },
    {
      id: 3,
      author: 'zzz',
      avatarText: 'Z',
      content: '잠은 못 자지만… 인정합니다. 너무 귀엽습니다.',
      createdAt: '10분 전',
      replies: [
        {
          id: 31,
          author: 'catlover',
          avatarText: 'C',
          content: '맞아요 ㅋㅋ 분노와 사랑이 동시에…',
          createdAt: '5분 전',
        },
      ],
    },
  ],
};

export default function ShorlogCommentSection({
                                                shorlogId,
                                                initialCommentCount,
                                              }: Props) {
  const [commentText, setCommentText] = useState('');
  const comments = mockCommentsByShorlogId[shorlogId] ?? [];

  const totalCount =
    comments.length === 0
      ? initialCommentCount
      : comments.reduce(
        (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
        0,
      );

  const handleCommentFocus = () => {
    if (!requireAuth('댓글 작성')) {
      // 포커스 해제
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const handleCommentSubmit = () => {
    if (!requireAuth('댓글 작성')) return;

    if (!commentText.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    // TODO: 실제 댓글 등록 API 호출
    alert('댓글 등록 기능은 추후 제공될 예정입니다.');
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

      {/* 리스트 */}
      {comments.length > 0 ? (
        <ul className="mt-4 space-y-3 text-xs">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem comment={comment} />
              {comment.replies && comment.replies.length > 0 && (
                <ul className="mt-2 space-y-2 border-l border-slate-100 pl-4">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem comment={reply} isReply />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-slate-400">
          댓글 리스트 영역입니다. 실제 구현 시 4번 댓글 컴포넌트를 여기로 가져오세요.
        </p>
      )}
    </div>
  );
}

function CommentItem({ comment, isReply }: { comment: Comment; isReply?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[12px] font-semibold text-slate-700">
        {comment.avatarText}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1">
          {/* 작성자 이름 살짝 크게 */}
          <span className="text-[14px] font-semibold text-slate-800">
            {comment.author}
          </span>
          {/* 시간도 한 단계 업 */}
          <span className="text-[12px] text-slate-400">{comment.createdAt}</span>
        </div>
        {/* 본문 텍스트 키우기 */}
        <p className="mt-0.5 text-[14px] leading-relaxed text-slate-700">
          {comment.content}
        </p>
        {!isReply && (
          <button
            type="button"
            className="mt-1 text-[11px] font-medium text-slate-400 hover:text-slate-600"
          >
            답글 달기
          </button>
        )}
      </div>
    </div>
  );
}
