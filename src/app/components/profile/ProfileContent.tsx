'use client';

import {
  getBookmarkedBlogs,
  getBookmarkedShorlogs,
  getMyBlogs,
  getMyShorlogs,
  getUserBlogs,
  getUserShorlogs,
} from '@/src/api/profileApi';
import { useAuth } from '@/src/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { BlogListView, ShorlogListView, SortButtons } from './ProfileContentFeed';
import { ProfileEmptyState } from './ProfileEmptyState';
import CreatorDashboardClient from './dashboad/CreatorDashboardClient';

type SortKey = 'latest' | 'popular' | 'oldest';
type PrimaryTab = 'mine' | 'bookmark' | 'dashboard';
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

  // React Query로 데이터 로드
  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId, isMyPage, primaryTab, sortKey],
    queryFn: async () => {
      if (primaryTab === 'dashboard') {
        // 대시보드 탭일 땐 이 쿼리는 사용하지 않음
        return { shorlogs: [], blogs: [] };
      }

      if (isMyPage) {
        if (primaryTab === 'mine') {
          const [shorts, longs] = await Promise.all([getMyShorlogs(sortKey), getMyBlogs(sortKey)]);
          return { shorlogs: shorts, blogs: longs };
        } else {
          const [shorts, longs] = await Promise.all([
            getBookmarkedShorlogs(sortKey),
            getBookmarkedBlogs(sortKey),
          ]);
          return { shorlogs: shorts, blogs: longs };
        }
      } else {
        const [shorts, longs] = await Promise.all([
          getUserShorlogs(userId, sortKey),
          getUserBlogs(userId, sortKey),
        ]);
        return { shorlogs: shorts, blogs: longs };
      }
    },
    enabled: primaryTab !== 'dashboard',
    staleTime: 0,
  });

  const shorlogs = data?.shorlogs ?? [];
  const blogs = data?.blogs ?? [];

  const shortCount = shorlogs.length;
  const longCount = blogs.length;
  const isEmpty = secondaryTab === 'short' ? shorlogs.length === 0 : blogs.length === 0;

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

            <button
              onClick={() => setPrimaryTab('dashboard')}
              className={`px-8 pb-2 border-b-2 ${
                primaryTab === 'dashboard'
                  ? 'border-slate-900 font-semibold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              대시보드
            </button>
          </div>

          {(primaryTab === 'mine' ) && (
            <div className="mb-1">
              <SortButtons sortKey={sortKey} setSortKey={setSortKey} />
            </div>
          )}
        </div>
      ) : (
        // 숏로그 블로그 탭들
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
          {(primaryTab === 'mine' || primaryTab === 'bookmark') && (
            <div className="mb-1">
              <SortButtons sortKey={sortKey} setSortKey={setSortKey} />
            </div>
          )}
        </div>
      )}

      {/* 서브 탭 (내 페이지일 때만) */}
      {isMyPage && primaryTab !== 'dashboard' && (
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

      {primaryTab === 'dashboard' ? (
        <CreatorDashboardClient />
      ) : isLoading ? (
        <div className="mt-8 text-center text-sm text-slate-600">불러오는 중…</div>
      ) : isEmpty ? (
        <ProfileEmptyState
          isMyPage={isMyPage}
          primaryTab={primaryTab}
          secondaryTab={secondaryTab}
        />
      ) : secondaryTab === 'short' ? (
        <ShorlogListView items={shorlogs} profileUserId={userId} />
      ) : (
        <BlogListView items={blogs} />
      )}
    </section>
  );
}
