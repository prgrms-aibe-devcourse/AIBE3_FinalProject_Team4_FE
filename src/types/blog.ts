export type BlogSortType = 'LATEST' | 'VIEWS' | 'POPULAR' | 'RECOMMEND';
export type BlogScope = 'ALL' | 'FOLLOWING';

export type RsData<T> = {
  resultCode: string;
  msg: string;
  data: T;
};

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
// 상세 화면에서 사용할 타입
export type BlogDetailDto = {
  id: number;
  title: string;
  content: string;
  username: string;
  nickname: string;
  profileImageUrl: string | null;
  thumbnailUrl: string | null;
  hashtagNames: string[];
  status: string;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  isLiked: boolean | null;
  isBookmarked: boolean | null;
  comments: unknown[];
  images: unknown[];
  linkedShorlogCount: number;
  hasLinkedShorlogs: boolean;
  createdAt: string; // LocalDateTime → ISO string
  updatedAt: string;
};

export interface BlogWriteRequest {
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  hashtagNames: string[];
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface BlogWriteDto {
  id: number;
  title: string;
  content: string;
  userId: number;
  thumbnailUrl: string | null;
  images: BlogFileDto[];
  hashtagNames: string[];
  status: string;
  createdAt: string;
  modifiedAt: string;
}
export interface BlogFileDto {
  image: string;
}
export type BlogVisibility = 'PUBLIC' | 'PRIVATE';

export type BlogFormValues = {
  title: string;
  contentMarkdown: string;
  tags: string[];
  visibility: BlogVisibility;
  thumbnailUrl?: string;
};