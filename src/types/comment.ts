export interface CommentType {
  id: number;
  content: string;
  nickname: string;
  userProfileImgUrl: string | null;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  isMine: boolean;

  children: CommentType[];
}
