export interface CommentType {
  _forceOpen: boolean | undefined;
  _highlight: boolean | undefined;
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
