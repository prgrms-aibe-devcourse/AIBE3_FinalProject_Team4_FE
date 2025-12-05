// src/types/main.ts
export type ContentType = 'SHORLOG' | 'BLOG';

export interface MainContentCard {
  id: number;
  type: 'BLOG' | 'SHORLOG';
  title: string;
  excerpt: string;
  thumbnailUrl: string | null;
  likeCount: number;
  bookmarkCount: number;
  viewCount: number;
  authorName: string;
  createdAt: string;
  score: number;
}

export interface RecommendedUser {
  id: number;
  nickname: string;
  bio: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
}

export interface MainSummary {
  popularContents: MainContentCard[];
  trendingHashtags: string[];
  recommendedUsers: RecommendedUser[];
}
