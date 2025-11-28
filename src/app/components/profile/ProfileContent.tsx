'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type SortKey = 'latest' | 'popular' | 'oldest';
type PrimaryTab = 'mine' | 'bookmark';
type SecondaryTab = 'short' | 'long';

interface ProfileContentProps {
  userId: string;
  isMyPage: boolean;
}

/** 공통 피드 구조 */
export interface ProfileFeedPost {
  id: number;
  type: 'short' | 'long';
  title: string;
  excerpt: string;
  nickname: string;
  thumbnailUrl: string | null;
  likeCount: number;
  commentCount: number;
  createdAt?: string;
  popularityScore: number;
}

export default function ProfileContent({ userId, isMyPage }: ProfileContentProps) {
  const { loginUser, isLogin } = useAuth();
  const isMe = isLogin && loginUser?.id === Number(userId);

  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('mine');
  const [secondaryTab, setSecondaryTab] = useState<SecondaryTab>('short');
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const [posts, setPosts] = useState<ProfileFeedPost[]>([]);
  const [loading, setLoading] = useState(false);

  const sortForApi = (key: SortKey) =>
    key === 'latest' ? 'LATEST' : key === 'popular' ? 'POPULAR' : 'OLDEST';

  /* 🔥 API 호출 */
  useEffect(() => {
    async function load() {
      setLoading(true);

      let data: ProfileFeedPost[] = [];

      // ⭐ 내 페이지일 때 : 기존 로직 그대로 유지
      if (isMyPage) {
        if (primaryTab === 'mine') {
          if (secondaryTab === 'short') data = await getMyShorlogs(sortKey);
          else data = await getMyBlogs(sortKey);
        } else {
          if (!isMe) data = [];
          else
            data =
              secondaryTab === 'short' ? await getBookmarkedShorlogs() : await getBookmarkedBlogs();
        }
      } else {
        // 다른사람 페이지 : primaryTab 대신 secondaryTab만 사용 (1차=short/long)
        if (secondaryTab === 'short') {
          data = await getUserShorlogs(userId);
        } else {
          data = await getUserBlogs(userId);
        }
      }

      setPosts(data);
      setLoading(false);
    }

    load();
  }, [isMyPage, primaryTab, secondaryTab, sortKey, isMe, userId]);

  /* 🔥 정렬 + 필터 */
  const filteredAndSorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (sortKey === 'latest') return +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0);
      if (sortKey === 'oldest') return +new Date(a.createdAt ?? 0) - +new Date(b.createdAt ?? 0);
      return b.popularityScore - a.popularityScore;
    });
  }, [posts, sortKey]);

  const shortCount = posts.filter((p) => p.type === 'short').length;
  const longCount = posts.filter((p) => p.type === 'long').length;

  return (
    <section className="space-y-4">
      {isMyPage ? (
        /* 내 페이지 */
        <div className="flex items-end justify-between border-b border-slate-200">
          <div className="flex gap-0 text-lg">
            <button
              onClick={() => setPrimaryTab('mine')}
              className={`px-8 pb-2 border-b-2 ${primaryTab === 'mine' ? 'border-slate-900 font-semibold' : 'border-transparent text-slate-500'}`}
            >
              내 글
            </button>

            {isMe && (
              <button
                onClick={() => setPrimaryTab('bookmark')}
                className={`px-8 pb-2 border-b-2 ${primaryTab === 'bookmark' ? 'border-slate-900 font-semibold' : 'border-transparent text-slate-500'}`}
              >
                북마크
              </button>
            )}
          </div>

          {/* 정렬 */}
          <SortButtons sortKey={sortKey} setSortKey={setSortKey} />
        </div>
      ) : (
        /* 다른사람 페이지 */
        <div className="flex items-end justify-between border-b border-slate-200">
          <div className="flex gap-0 text-lg">
            <button
              onClick={() => setSecondaryTab('short')}
              className={`px-8 pb-2 border-b-2 ${secondaryTab === 'short' ? 'border-slate-900 font-semibold' : 'border-transparent text-slate-500'}`}
            >
              숏로그
            </button>

            <button
              onClick={() => setSecondaryTab('long')}
              className={`px-8 pb-2 border-b-2 ${secondaryTab === 'long' ? 'border-slate-900 font-semibold' : 'border-transparent text-slate-500'}`}
            >
              블로그
            </button>
          </div>

          <SortButtons sortKey={sortKey} setSortKey={setSortKey} />
        </div>
      )}

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

      {loading ? (
        <div className="mt-8 text-center text-sm text-slate-600">불러오는 중…</div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="mt-8 text-center text-sm text-slate-600">
          {isMyPage && primaryTab === 'bookmark'
            ? '아직 북마크 글이 없어요.'
            : '아직 작성한 글이 없어요.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {filteredAndSorted.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}

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

function FeedCard({ post }: { post: ProfileFeedPost }) {
  return (
    <a
      href={`/posts/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:-translate-y-1 hover:shadow-md transition"
    >
      <div className="relative w-full bg-slate-100 overflow-hidden">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={`${post.title} 썸네일`}
            className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-60 w-full bg-slate-200" />
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2 pt-10 text-white text-[11px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">♡ {post.likeCount}</span>
            <span className="flex items-center gap-1">💬 {post.commentCount}</span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2">
        <p className="line-clamp-2 text-[13px] leading-snug text-slate-800">{post.excerpt}</p>

        <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
          {post.type === 'short' ? '숏로그' : '블로그'}
        </span>
      </div>
    </a>
  );
}

// 블로그: /api/v1/blogs/my
async function getMyBlogs(sortKey: SortKey): Promise<ProfileFeedPost[]> {
  const page = 0;
  const size = 20;
  const sortType = sortKey; // LATEST / POPULAR / OLDEST

  const res = await fetch(
    `${API_BASE_URL}/api/v1/blogs/my?page=${page}&size=${size}&sortType=${sortType}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const json = await res.json();
  const content = json.data?.content ?? json.content ?? [];

  return content.map(
    (item: any): ProfileFeedPost => ({
      id: item.id,
      type: 'long',
      title: item.title,
      excerpt: item.content,
      thumbnailUrl: item.thumbnailUrl ?? null,
      nickname: item.nickname,
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      createdAt: item.createdAt,
      // 간단한 인기 점수: 좋아요*2 + 북마크*3 + 조회수
      popularityScore:
        (item.likeCount ?? 0) * 2 + (item.bookmarkCount ?? 0) * 3 + (item.viewCount ?? 0),
    }),
  );
}

// 숏로그: /api/v1/shorlog/my
async function getMyShorlogs(sortKey: SortKey): Promise<ProfileFeedPost[]> {
  const sort = sortKey === 'latest' ? 'latest' : sortKey === 'popular' ? 'popular' : 'oldest';
  const page = 0;

  const res = await fetch(`${API_BASE_URL}/api/v1/shorlog/my?sort=${sort}&page=${page}`, {
    method: 'GET',
    credentials: 'include',
  });

  const json = await res.json();
  const content = json.data?.content ?? json.content ?? [];

  return content.map(
    (item: any): ProfileFeedPost => ({
      id: item.id,
      type: 'short',
      title: item.firstLine,
      excerpt: item.firstLine,
      thumbnailUrl: item.thumbnailUrl ?? null,
      nickname: item.nickname,
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      // 숏로그에는 createdAt이 없으니 생략
      createdAt: undefined,
      // 간단한 인기 점수: 좋아요 + 댓글*2
      popularityScore: (item.likeCount ?? 0) + (item.commentCount ?? 0) * 2,
    }),
  );
}

async function getUserShorlogs(userId: string): Promise<ProfileFeedPost[]> {
  return [];
}

async function getUserBlogs(userId: string): Promise<ProfileFeedPost[]> {
  return [];
}

// 북마크는 아직 API 없으니 임시 구현
async function getBookmarkedShorlogs(): Promise<ProfileFeedPost[]> {
  return [];
}

async function getBookmarkedBlogs(): Promise<ProfileFeedPost[]> {
  return [];
}
