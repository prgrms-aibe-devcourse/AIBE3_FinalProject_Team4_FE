export interface ShorlogDetail {
  id: number;
  userId: number;
  username: string;
  nickname: string;
  profileImgUrl: string | null;
  content: string;
  thumbnailUrls: string[];
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  hashtags: string[];
  createdAt: string;
  modifiedAt: string;
  linkedBlogId: number | null;
}
