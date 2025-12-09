import { CommentType } from '../../../types/comment';
import CommentItem from './ShorlogCommentItem';

interface CommentListProps {
  comments: (CommentType & {
    _highlight?: boolean;
    _forceOpen?: boolean;
  })[];
  onLike: (id: number) => Promise<void>;
  onReply: (parentId: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number, newContent: string) => Promise<void>;
}

export default function ShorlogCommentList({
  comments,
  onLike,
  onReply,
  onDelete,
  onEdit,
}: CommentListProps) {
  // 댓글이 없을 경우 표시
  if (!comments || comments.length === 0) {
    return (
      <p className="text-xs text-slate-400 py-4 text-center">
        아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
      </p>
    );
  }

  // 댓글 목록 렌더링
  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          onLike={onLike}
          onReply={onReply}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
