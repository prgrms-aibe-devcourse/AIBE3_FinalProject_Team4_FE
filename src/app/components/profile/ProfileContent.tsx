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
          // 내 페이지
          if (primaryTab === 'mine') {
            if (secondaryTab === 'short') {
              setShorlogs(await getMyShorlogs(sortKey));
            } else {
              setBlogs(await getMyBlogs(sortKey));
            }
          } else {
            // 북마크
            if (secondaryTab === 'short') {
              setShorlogs(await getBookmarkedShorlogs(sortKey));
            } else {
              setBlogs(await getBookmarkedBlogs(sortKey));
            }
          }
        } else {
          // 다른 사람 페이지
          if (secondaryTab === 'short') {
            setShorlogs(await getUserShorlogs(userId, sortKey));
          } else {
            setBlogs(await getUserBlogs(userId, sortKey));
          }
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, isMyPage, primaryTab, secondaryTab, sortKey]);

  const shortCount = shorlogs.length;
  const longCount = blogs.length;

  /* =========================================================
     5) 렌더링
     ========================================================= */

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

          <SortButtons sortKey={sortKey} setSortKey={setSortKey} />
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

          <SortButtons sortKey={sortKey} setSortKey={setSortKey} />
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
        <ShorlogListView items={shorlogs} />
      ) : (
        <BlogListView items={blogs} />
      )}
    </section>
  );
}

/* =========================================================
   6) 리스트 UI
   ========================================================= */

function ShorlogListView({ items }: { items: ShorlogItem[] }) {
  if (items.length === 0) return <p className="mt-8 text-sm text-slate-600">쇼로그가 없어요.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <ShorlogCardProfile key={item.id} item={item} />
      ))}
    </div>
  );
}

function BlogListView({ items }: { items: BlogSummary[] }) {
  if (items.length === 0) return <p className="mt-8 text-sm text-slate-600">블로그가 없어요.</p>;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <BlogListItem key={item.id} item={item} />
      ))}
    </div>
  );
}

/* =========================================================
   7) 블로그 카드 (Figma 기반 UI)
   ========================================================= */

function BlogListItem({ item }: { item: BlogSummary }) {
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

        <button className="self-start text-[12px] text-[#2979FF] font-medium whitespace-nowrap">
          연결 쇼로그
        </button>
      </div>
    </a>
  );
}

/* =========================================================
   8) 숏로그 카드 (프로필 버전)
   ========================================================= */

function ShorlogCardProfile({ item }: { item: ShorlogItem }) {
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

/* =========================================================
   9) 정렬 탭
   ========================================================= */

function SortButtons({
  sortKey,
  setSortKey,
}: {
  sortKey: SortKey;
  setSortKey: (v: SortKey) => void;
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
          onClick={() => setSortKey(item.key as SortKey)}
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

/* =========================================================
   10) 상대 날짜 포맷
   ========================================================= */

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
