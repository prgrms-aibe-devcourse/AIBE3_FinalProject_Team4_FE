'use client';

import { CommentType } from '@/src/types/comment';
import BlogCommentItem from './BlogCommentItem';

interface Props {
  comments: (CommentType & {
    _highlight?: boolean;
    _forceOpen?: boolean;
  })[];
  onReply: (parentId: number, text: string) => Promise<void>;
  onLike: (commentId: number) => Promise<void>;
  onEdit: (commentId: number, text: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}

export default function BlogCommentList({ comments, onReply, onLike, onEdit, onDelete }: Props) {
  // 댓글이 하나도 없을 경우 표시
  if (!comments || comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
      </p>
    );
  }

  // 댓글 목록 렌더링
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
        />
      ))}
    </div>
  );
}
