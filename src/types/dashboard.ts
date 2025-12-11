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
}
