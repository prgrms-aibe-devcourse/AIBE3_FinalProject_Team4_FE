export interface DailyViews30dItem {
  date: string; // "YYYY-MM-DD"
  blogViews: number;
  shorlogViews: number;
}

export type DailyView = {
  date: string; // "2025-12-13"
  blogViews: number;
  shorlogViews: number;
};

export interface CreatorOverview {
  periodDays: number;

  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  followerCount: number;

  periodViews: number;
  periodLikes: number;
  periodBookmarks: number;
  periodComments: number;
  periodFollowers: number;

  likeRate: number; // %
  bookmarkRate: number; // %
  viewsPerFollower: number; // n

  viewsChangeRate: number | null;
  likesChangeRate: number | null;
  bookmarksChangeRate: number | null;
  followersChangeRate: number | null;

  // ✅ 추가
  dailyViews30d: DailyView[];
}
