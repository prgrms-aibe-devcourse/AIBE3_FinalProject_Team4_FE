export type BlogSortType = 'LATEST' | 'VIEWS' | 'POPULAR' | 'RECOMMEND';
export type BlogScope = 'ALL' | 'FOLLOWING';

export interface BlogSummary {
  id: number;
  userId: number;
  userNickname: string;
  profileImageUrl: string | null;
  title: string;
  contentPre: string;
  thumbnailUrl: string | null;
  hashtagNames: string[];
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface BlogSliceResponse<T> {
  content: T[];
  hasNext: boolean;
  nextCursor: string | null;
}
