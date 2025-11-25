// app/components/profile/ProfileContentTabs.tsx
'use client';

import { ShorlogCard } from '@/app/components/profile/ShorlogCard';
import { cn } from '@/app/lib/cn';
import { ShorlogPost } from '@/app/profile/page';
import { useMemo, useState } from 'react';

type SortKey = 'latest' | 'popular' | 'oldest';
type PrimaryTab = 'mine' | 'bookmark';
type SecondaryTab = 'short' | 'long';

export const ProfileContentTabs = ({ posts }: { posts: ShorlogPost[] }) => {
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('mine');
  const [secondaryTab, setSecondaryTab] = useState<SecondaryTab>('short');
  const [sortKey, setSortKey] = useState<SortKey>('latest');

  const filteredAndSorted = useMemo(() => {
    const filtered = posts.filter((p) =>
      secondaryTab === 'short' ? p.type === 'short' : p.type === 'long',
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'latest') return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (sortKey === 'oldest') return +new Date(a.createdAt) - +new Date(b.createdAt);
      return b.popularityScore - a.popularityScore;
    });

    return sorted;
  }, [posts, secondaryTab, sortKey]);

  const shortCount = posts.filter((p) => p.type === 'short').length;
  const longCount = posts.filter((p) => p.type === 'long').length;

  return (
    <section className="space-y-4">
      {/* 상단 탭 + 정렬 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-6 text-sm">
          <button
            onClick={() => setPrimaryTab('mine')}
            className={cn(
              'pb-2 border-b-2 -mb-px',
              primaryTab === 'mine'
                ? 'border-slate-900 font-semibold'
                : 'border-transparent text-slate-500',
            )}
          >
            내 글
          </button>

          <button
            onClick={() => setPrimaryTab('bookmark')}
            className={cn(
              'pb-2 border-b-2 -mb-px',
              primaryTab === 'bookmark'
                ? 'border-slate-900 font-semibold'
                : 'border-transparent text-slate-500',
            )}
          >
            북마크
          </button>
        </div>

        {/* 정렬 */}
        <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-[13px]">
          {[
            { key: 'latest', label: '최신' },
            { key: 'popular', label: '인기' },
            { key: 'oldest', label: '오래된 순' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSortKey(item.key as SortKey)}
              className={cn(
                'px-3 py-1.5 rounded-full',
                sortKey === item.key ? 'bg-white shadow text-slate-900' : 'text-slate-500',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 숏로그/블로그 */}
      <div className="flex gap-6 text-[13px]">
        <button
          onClick={() => setSecondaryTab('short')}
          className={cn(
            'pb-1 border-b-2 -mb-px',
            secondaryTab === 'short'
              ? 'border-slate-900 font-semibold'
              : 'border-transparent text-slate-500',
          )}
        >
          숏로그 <span className="text-slate-400">{shortCount}개</span>
        </button>

        <button
          onClick={() => setSecondaryTab('long')}
          className={cn(
            'pb-1 border-b-2 -mb-px',
            secondaryTab === 'long'
              ? 'border-slate-900 font-semibold'
              : 'border-transparent text-slate-500',
          )}
        >
          블로그 <span className="text-slate-400">{longCount}개</span>
        </button>
      </div>

      {/* 카드 리스트 */}
      {filteredAndSorted.length === 0 ? (
        <div className="mt-8 text-center text-sm text-slate-600">아직 작성한 글이 없어요.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {filteredAndSorted.map((post) => (
            <ShorlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
};
