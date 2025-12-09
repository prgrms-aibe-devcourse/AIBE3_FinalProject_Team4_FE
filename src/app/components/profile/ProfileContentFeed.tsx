'use client';

import type { ShorlogItem } from '@/src/app/components/shorlog/feed/ShorlogFeedPageClient';
import type { BlogSummary } from '@/src/types/blog';
import { Bookmark, Eye, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function ShorlogListView({
  items,
  profileUserId,
}: {
  items: ShorlogItem[];
  profileUserId: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 gap-y-4">
      {items.map((item, index) => (
        <ShorlogCardProfile
          key={item.id}
          item={item}
          index={index}
          allItems={items}
          profileUserId={profileUserId}
        />
      ))}
    </div>
  );
}

export function ShorlogCardProfile({
  item,
  index,
  allItems,
  profileUserId,
}: {
  item: ShorlogItem;
  index: number;
  allItems: ShorlogItem[];
  profileUserId: string;
}) {
  const prevItem = index > 0 ? allItems[index - 1] : null;
  const nextItem = index < allItems.length - 1 ? allItems[index + 1] : null;

  const queryParams = new URLSearchParams();
  if (prevItem) queryParams.set('prev', prevItem.id.toString());
  if (nextItem) queryParams.set('next', nextItem.id.toString());
  queryParams.set('profileId', profileUserId);

  const href = `/shorlog/${item.id}?${queryParams.toString()}`;

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      const feedIds = allItems.map((item) => item.id);
      sessionStorage.setItem('shorlog_feed_ids', JSON.stringify(feedIds));
      sessionStorage.setItem('shorlog_current_index', index.toString());
      sessionStorage.setItem('shorlog_source', 'profile');
      sessionStorage.setItem('shorlog_profile_user_id', profileUserId);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="
        group flex flex-col overflow-hidden rounded-xl bg-white
        ring-1 ring-slate-100 shadow-sm
        transition-all hover:-translate-y-0.5 hover:shadow-md
      "
    >
      {/* ✅ 이미지 영역: 높이(비중) 조금 줄임 */}
      <div className="relative w-full overflow-hidden bg-slate-100 aspect-square">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.firstLine}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200" />
        )}

        {/* ✅ 좋아요/댓글: 이미지 좌측 하단 유지 (더 타이트하게) */}
        <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2 pt-10">
          <div className="inline-flex items-center gap-3 rounded-full bg-black/35 px-2.5 py-1 text-white text-[12px] backdrop-blur-[2px]">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-white" /> {item.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5 text-white" /> {item.commentCount}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ 텍스트 영역: flex-1 제거 + 최소 높이로 ‘내용 비중’ 확보 */}
      <div className="bg-slate-50 px-2.5 py-2 min-h-[52px]">
        <p className="line-clamp-2 text-[13px] leading-snug text-slate-800">{item.firstLine}</p>
      </div>
    </Link>
  );
}

export function BlogListView({ items }: { items: BlogSummary[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <BlogListItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export function BlogListItem({ item }: { item: BlogSummary }) {
  const hasThumbnail = !!item.thumbnailUrl;

  return (
    <a
      href={`/blogs/${item.id}`}
      className="block w-full rounded-lg bg-white shadow-sm ring-1 ring-slate-100 p-2 hover:-translate-y-0.5 hover:shadow-md transition"
    >
      <div className="flex gap-4 items-start">
        {/* 썸네일 */}
        <div className="flex-shrink-0">
          {hasThumbnail ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-md bg-slate-100">
              <img
                src={item.thumbnailUrl!}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-md bg-slate-200 text-[11px] text-slate-500">
              썸네일 없음
            </div>
          )}
        </div>

        {/* 텍스트 */}
        <div className="flex-1 space-y-3">
          {/* 제목 + 날짜 (좌/우 배치) */}
          <div className="flex items-center justify-between">
            <h2 className="line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base">
              {item.title}
            </h2>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 whitespace-nowrap mr-3">
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>

          {/* 요약 */}
          <p className="line-clamp-1 text-xs text-slate-500 sm:text-sm">{item.contentPre}</p>

          {/* 태그 */}
          <div className="flex flex-wrap gap-1">
            {item.hashtagNames.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Eye size={14} className="text-slate-400" />
              {item.viewCount}
            </span>

            <span className="flex items-center gap-1">
              <Heart size={14} className="text-slate-400" />
              {item.likeCount}
            </span>

            <span className="flex items-center gap-1">
              <MessageCircle size={14} className="text-slate-400" />
              {item.commentCount}
            </span>

            <span className="flex items-center gap-1">
              <Bookmark size={14} className="text-slate-400" />
              {item.bookmarkCount}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

export function SortButtons({
  sortKey,
  setSortKey,
}: {
  sortKey: 'latest' | 'popular' | 'oldest';
  setSortKey: (v: 'latest' | 'popular' | 'oldest') => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md bg-slate-100 p-0.5 text-[13px]">
      {[
        { key: 'latest', label: '최신' },
        { key: 'popular', label: '인기' },
        { key: 'oldest', label: '오래된 순' },
      ].map((item) => (
        <button
          key={item.key}
          onClick={() => setSortKey(item.key as any)}
          className={`px-3 py-1.5 rounded-md ${
            sortKey === item.key ? 'bg-white shadow text-slate-900' : 'text-slate-500'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
