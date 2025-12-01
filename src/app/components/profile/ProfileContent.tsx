'use client';

import {
  getBookmarkedBlogs,
  getBookmarkedShorlogs,
  getMyBlogs,
  getMyShorlogs,
  getUserBlogs,
  getUserShorlogs,
} from '@/src/api/profileApi';
import type { ShorlogItem } from '@/src/app/components/shorlog/feed/ShorlogFeedPageClient';
import { useAuth } from '@/src/providers/AuthProvider';
import type { BlogSummary } from '@/src/types/blog';
import { useEffect, useState } from 'react';
import { BlogListView, ShorlogListView, SortButtons } from './ProfileContentFeed';

type SortKey = 'latest' | 'popular' | 'oldest';
type PrimaryTab = 'mine' | 'bookmark';
type SecondaryTab = 'short' | 'long';

interface ProfileContentProps {
  userId: string;
  isMyPage: boolean;
}

export default function ProfileContent({ userId, isMyPage }: ProfileContentProps) {
  const { loginUser, isLogin } = useAuth();
  const isMe = isLogin && loginUser?.id === Number(userId);

  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('mine');
  const [secondaryTab, setSecondaryTab] = useState<SecondaryTab>('short');
  const [sortKey, setSortKey] = useState<SortKey>('latest');

  const [shorlogs, setShorlogs] = useState<ShorlogItem[]>([]);
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        if (isMyPage) {
          if (primaryTab === 'mine') {
            const shortPromise = getMyShorlogs(sortKey);
            const longPromise = getMyBlogs(sortKey);

            const [shorts, longs] = await Promise.all([shortPromise, longPromise]);

            setShorlogs(shorts);
            setBlogs(longs);
          } else {
            const shortPromise = getBookmarkedShorlogs(sortKey);
            const longPromise = getBookmarkedBlogs(sortKey);

            const [shorts, longs] = await Promise.all([shortPromise, longPromise]);

            setShorlogs(shorts);
            setBlogs(longs);
          }
        } else {
          const shortPromise = getUserShorlogs(userId, sortKey);
          const longPromise = getUserBlogs(userId, sortKey);

          const [shorts, longs] = await Promise.all([shortPromise, longPromise]);

          setShorlogs(shorts);
          setBlogs(longs);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, isMyPage, primaryTab, sortKey]);

  const shortCount = shorlogs.length;
  const longCount = blogs.length;

  return (
    <section className="space-y-4">
      {/* 상단 탭 */}
      {isMyPage ? (
        <div className="flex items-end justify-between border-b border-slate-200">
          <div className="flex text-lg">
            <button
              onClick={() => setPrimaryTab('mine')}
              className={`px-8 pb-2 border-b-2 ${
                primaryTab === 'mine'
                  ? 'border-slate-900 font-semibold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              내 글
            </button>

            <button
              onClick={() => setPrimaryTab('bookmark')}
              className={`px-8 pb-2 border-b-2 ${
                primaryTab === 'bookmark'
                  ? 'border-slate-900 font-semibold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              북마크
            </button>
          </div>

          {primaryTab !== 'bookmark' && (
            <div className="mb-1">
              <SortButtons sortKey={sortKey} setSortKey={setSortKey} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-end justify-between border-b border-slate-200">
          <div className="flex text-lg">
            <button
              onClick={() => setSecondaryTab('short')}
              className={`px-8 pb-2 border-b-2 ${
                secondaryTab === 'short'
                  ? 'border-slate-900 font-semibold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              숏로그
            </button>

            <button
              onClick={() => setSecondaryTab('long')}
              className={`px-8 pb-2 border-b-2 ${
                secondaryTab === 'long'
                  ? 'border-slate-900 font-semibold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              블로그
            </button>
          </div>

          <div className="mb-1">
            <SortButtons sortKey={sortKey} setSortKey={setSortKey} />
          </div>
        </div>
      )}

      {/* 서브 탭 (내 페이지일 때만) */}
      {isMyPage && (
        <div className="inline-flex items-center rounded-md p-0.5 text-[14px]">
          <button
            onClick={() => setSecondaryTab('short')}
            className={`px-4 py-1.5 rounded-md ${
              secondaryTab === 'short'
                ? 'bg-slate-100 font-semibold text-slate-900'
                : 'text-slate-500'
            }`}
          >
            숏로그 <span className="text-slate-400">{shortCount}개</span>
          </button>

          <button
            onClick={() => setSecondaryTab('long')}
            className={`px-4 py-1.5 rounded-md ${
              secondaryTab === 'long'
                ? 'bg-slate-100 font-semibold text-slate-900'
                : 'text-slate-500'
            }`}
          >
            블로그 <span className="text-slate-400">{longCount}개</span>
          </button>
        </div>
      )}

      {/* 리스트 */}
      {loading ? (
        <div className="mt-8 text-center text-sm text-slate-600">불러오는 중…</div>
      ) : secondaryTab === 'short' ? (
        <ShorlogListView items={shorlogs} profileUserId={userId} />
      ) : (
        <BlogListView items={blogs} />
      )}
    </section>
  );
}
