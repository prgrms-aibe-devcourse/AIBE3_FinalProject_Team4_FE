'use client';

import CommentItem from './commentItem';

interface CommentListProps {
  comments: any[];
  onReply: (parentId: number, text: string) => void;
  onLike: (commentId: number) => void;
}

export default function CommentList({ comments, onReply, onLike }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <p className="mt-2 text-xs text-slate-400">
        아직 댓글이 없습니다. 가장 먼저 댓글을 남겨보세요!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onReply={onReply} onLike={onLike} />
      ))}
    </div>
  );
}
