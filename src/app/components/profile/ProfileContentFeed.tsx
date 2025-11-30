'use client';

import type { ShorlogItem } from '@/src/app/components/shorlog/feed/ShorlogFeedPageClient';
import type { BlogSummary } from '@/src/types/blog';

export function ShorlogCardProfile({ item }: { item: ShorlogItem }) {
  return (
    <a
      href={`/shorlog/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <img
          src={item.thumbnailUrl ?? '/images/default-thumbnail.jpg'}
          className="h-full w-full object-cover group-hover:scale-105 transition"
          alt={item.firstLine}
        />
      </div>

      <div className="px-3 py-2">
        <p className="text-sm font-medium text-slate-800 line-clamp-2">{item.firstLine}</p>
        <div className="flex items-center justify-start gap-4 mt-2 text-xs text-slate-500">
          <span>♡ {item.likeCount}</span>
          <span>💬 {item.commentCount}</span>
        </div>
      </div>
    </a>
  );
}

export function ShorlogListView({ items }: { items: ShorlogItem[] }) {
  if (items.length === 0) return <p className="mt-8 text-sm text-slate-600">쇼로그가 없어요.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <ShorlogCardProfile key={item.id} item={item} />
      ))}
    </div>
  );
}

export function BlogListItem({ item }: { item: BlogSummary }) {
  return (
    <a
      href={`/blogs/${item.id}`}
      className="block w-full rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-4 hover:shadow-md transition"
    >
      <div className="flex gap-4">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="h-24 w-24 rounded-md object-cover"
          />
        ) : (
          <div className="h-24 w-24 rounded-md bg-slate-200 flex items-center justify-center text-xs text-slate-500">
            썸네일 없음
          </div>
        )}

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{item.userNickname}</span>
            <span>•</span>
            <span>{formatDate(item.createdAt)}</span>
          </div>

          <p className="text-base font-semibold text-slate-900 line-clamp-1">{item.title}</p>
          <p className="text-sm text-slate-600 line-clamp-1">{item.contentPre}</p>

          <div className="flex gap-1 flex-wrap mt-1">
            {item.hashtagNames.map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
            <span>👁 {item.viewCount}</span>
            <span>♡ {item.likeCount}</span>
            <span>💬 {item.commentCount}</span>
            <span>🔖 {item.bookmarkCount}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

export function BlogListView({ items }: { items: BlogSummary[] }) {
  if (items.length === 0) return <p className="mt-8 text-sm text-slate-600">블로그가 없어요.</p>;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <BlogListItem key={item.id} item={item} />
      ))}
    </div>
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
