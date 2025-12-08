'use client';

import { CommentType } from '@/src/types/comment';
import BlogCommentItem from './BlogCommentItem';

interface Props {
  comments: CommentType[];
  onReply: (parentId: number, text: string) => Promise<void>;
  onLike: (commentId: number) => Promise<void>;
  onEdit: (commentId: number, text: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  highlightRef?: React.RefObject<HTMLDivElement | null>;
}

export default function BlogCommentList({
  comments,
  onReply,
  onLike,
  onEdit,
  onDelete,
  highlightRef,
}: Props) {
  if (!comments || comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <BlogCommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onLike={onLike}
          onEdit={onEdit}
          onDelete={onDelete}
          highlightRef={highlightRef}
        />
      ))}
    </div>
  );
}
