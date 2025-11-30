// src/features/profile/api/profileApis.ts

import type { ShorlogItem } from '@/src/app/components/shorlog/feed/ShorlogFeedPageClient';
import type { BlogSummary } from '@/src/types/blog';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export type SortKey = 'latest' | 'popular' | 'oldest';

export const apiSort = (k: SortKey) =>
  k === 'latest' ? 'LATEST' : k === 'popular' ? 'POPULAR' : 'OLDEST';

export async function getMyShorlogs(sort: SortKey): Promise<ShorlogItem[]> {
  const res = await fetch(`${API}/api/v1/shorlog/my?sort=${sort}&page=0`, {
    credentials: 'include',
  });
  const json = await res.json();

  return (
    json.data?.content?.map(
      (i: any): ShorlogItem => ({
        id: i.id,
        thumbnailUrl: i.thumbnailUrl,
        profileImgUrl: i.profileImgUrl,
        nickname: i.nickname,
        hashtags: i.hashtags ?? [],
        likeCount: i.likeCount,
        commentCount: i.commentCount,
        firstLine: i.firstLine,
      }),
    ) ?? []
  );
}

export async function getMyBlogs(sort: SortKey): Promise<BlogSummary[]> {
  const res = await fetch(`${API}/api/v1/blogs/my?page=0&size=20&sortType=${apiSort(sort)}`, {
    credentials: 'include',
  });

  const json = await res.json();
  const items = json.content ?? [];

  return items.map(
    (i: any): BlogSummary => ({
      id: i.id,
      userId: i.userId,
      userNickname: i.nickname,
      profileImageUrl: i.profileImageUrl,
      title: i.title,
      contentPre: i.contentPre ?? i.content ?? '',
      thumbnailUrl: i.thumbnailUrl,
      hashtagNames: i.hashtagNames,
      viewCount: i.viewCount,
      likeCount: i.likeCount,
      bookmarkCount: i.bookmarkCount,
      commentCount: i.commentCount,
      createdAt: i.createdAt,
      modifiedAt: i.modifiedAt,
      likedByMe: i.likedByMe,
      bookmarkedByMe: i.bookmarkedByMe,
    }),
  );
}

export async function getBookmarkedShorlogs(sort: SortKey): Promise<ShorlogItem[]> {
  const res = await fetch(`${API}/api/v1/shorlog/bookmark?sort=${sort}&page=0`, {
    credentials: 'include',
  });

  const json = await res.json();

  return (
    json.data?.bookmarks?.map(
      (i: any): ShorlogItem => ({
        id: i.id,
        thumbnailUrl: i.thumbnailUrl,
        profileImgUrl: i.profileImgUrl,
        nickname: i.nickname,
        hashtags: i.hashtags ?? [],
        likeCount: i.likeCount,
        commentCount: i.commentCount,
        firstLine: i.firstLine,
      }),
    ) ?? []
  );
}

export async function getBookmarkedBlogs(sort: SortKey): Promise<BlogSummary[]> {
  const res = await fetch(
    `${API}/api/v1/blogs/bookmarks?page=0&size=20&sortType=${apiSort(sort)}`,
    {
      credentials: 'include',
    },
  );

  const json = await res.json();
  const items = json.content ?? [];

  return items.map(
    (i: any): BlogSummary => ({
      id: i.id,
      userId: i.userId,
      userNickname: i.nickname,
      profileImageUrl: i.profileImageUrl,
      title: i.title,
      contentPre: i.contentPre ?? i.content ?? '',
      thumbnailUrl: i.thumbnailUrl,
      hashtagNames: i.hashtagNames,
      viewCount: i.viewCount,
      likeCount: i.likeCount,
      bookmarkCount: i.bookmarkCount,
      commentCount: i.commentCount,
      createdAt: i.createdAt,
      modifiedAt: i.modifiedAt,
      likedByMe: i.likedByMe,
      bookmarkedByMe: i.bookmarkedByMe,
    }),
  );
}

export async function getUserShorlogs(userId: string, sort: SortKey): Promise<ShorlogItem[]> {
  const res = await fetch(`${API}/api/v1/shorlog/user/${userId}?sort=${sort}&page=0`, {
    credentials: 'include',
  });

  const json = await res.json();

  return (
    json.data?.content?.map(
      (i: any): ShorlogItem => ({
        id: i.id,
        thumbnailUrl: i.thumbnailUrl,
        profileImgUrl: i.profileImgUrl,
        nickname: i.nickname,
        hashtags: i.hashtags,
        likeCount: i.likeCount,
        commentCount: i.commentCount,
        firstLine: i.firstLine,
      }),
    ) ?? []
  );
}

export async function getUserBlogs(userId: string, sort: SortKey): Promise<BlogSummary[]> {
  const res = await fetch(
    `${API}/api/v1/users/${userId}/blogs?page=0&size=20&sortType=${apiSort(sort)}`,
    {
      credentials: 'include',
    },
  );

  const json = await res.json();

  const items = json.content ?? [];

  return items.map(
    (i: any): BlogSummary => ({
      id: i.id,
      userId: i.userId,
      userNickname: i.nickname,
      profileImageUrl: i.profileImageUrl,
      title: i.title,
      contentPre: i.contentPre ?? i.content ?? '',
      thumbnailUrl: i.thumbnailUrl,
      hashtagNames: i.hashtagNames,
      viewCount: i.viewCount,
      likeCount: i.likeCount,
      bookmarkCount: i.bookmarkCount,
      commentCount: i.commentCount,
      createdAt: i.createdAt,
      modifiedAt: i.modifiedAt,
      likedByMe: i.likedByMe,
      bookmarkedByMe: i.bookmarkedByMe,
    }),
  );
}
