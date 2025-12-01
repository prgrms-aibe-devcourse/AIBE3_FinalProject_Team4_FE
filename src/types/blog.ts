export type BlogSortType = 'LATEST' | 'VIEWS' | 'POPULAR' | 'RECOMMEND';
export type BlogScope = 'ALL' | 'FOLLOWING';
export type BlogStatus = 'DRAFT' | 'PUBLISHED';

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
  images: BlogFileDto[];
  linkedShorlogCount: number;
  hasLinkedShorlogs: boolean;
  createdAt: string;
  updatedAt: string;
};

// 작성 dto
export type BlogWriteReqBody = {
  title: string;
  content: string;
  status: BlogStatus;
  hashtagNames: string[];
};

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
  imageId: number;
  url: string;
  sortOrder: number;
  contentType: string;
}

// 프론트용 이름
export type BlogImage = BlogFileDto;

export type BlogVisibility = 'PUBLIC' | 'PRIVATE';

export type BlogFormValues = {
  title: string;
  contentMarkdown: string;
  tags: string[];
  status: BlogStatus;
  visibility: 'PUBLIC' | 'PRIVATE';
};
export type MediaKind = 'IMAGE' | 'VIDEO';
export type ImageType = 'THUMBNAIL' | 'CONTENT';

export type BlogMediaUploadResponse = {
  imageId: number;
  url: string;
  kind: MediaKind;
};
export interface BlogDraftDto {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  isPublic: boolean;
  status: BlogStatus; // Java의 BlogStatus enum
  modifiedAt: string; // LocalDateTime -> ISO string
}

export type BlogLikeResponse = {
  blogId: number;
  isLiked: boolean;
  likeCount: number;
};

export type BlogBookmarkResponse = {
  blogId: number;
  isBookmarked: boolean;
  bookmarkCount: number;
};

export type ViewResponse = {
  blogId: number;
  viewCount: number;
};