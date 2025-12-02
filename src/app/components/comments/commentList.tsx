import { CommentType } from '../../../types/comment';
import CommentItem from './commentItem';

interface CommentListProps {
  comments: CommentType[];
  onLike: (id: number) => Promise<void>;
  onReply: (parentId: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number, newContent: string) => Promise<void>;
}

export default function CommentList({
  comments,
  onLike,
  onReply,
  onDelete,
  onEdit,
}: CommentListProps) {
  return (
    <div>
      {comments.map((c: CommentType) => (
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
