'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type SortKey = 'latest' | 'popular' | 'oldest';
type PrimaryTab = 'mine' | 'bookmark';
type SecondaryTab = 'short' | 'long';

interface ProfileContentProps {
  userId: string;
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

export default function ProfileContent({ userId }: ProfileContentProps) {
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

      if (primaryTab === 'mine') {
        if (secondaryTab === 'short') data = await getMyShorlogs(sortKey);
        else data = await getMyBlogs(sortKey);
      } else {
        if (!isMe) data = [];
        else {
          data =
            secondaryTab === 'short' ? await getBookmarkedShorlogs() : await getBookmarkedBlogs();
        }
      }

      setPosts(data);
      setLoading(false);
    }

    load();
  }, [primaryTab, secondaryTab, sortKey, isMe]);

  /* 🔥 정렬 + 필터 */
  const filteredAndSorted = useMemo(() => {
    const filtered = posts.filter((p) =>
      secondaryTab === 'short' ? p.type === 'short' : p.type === 'long',
    );

    return [...filtered].sort((a, b) => {
      if (sortKey === 'latest') return +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0);
      if (sortKey === 'oldest') return +new Date(a.createdAt ?? 0) - +new Date(b.createdAt ?? 0);

      return b.popularityScore - a.popularityScore;
    });
  }, [posts, secondaryTab, sortKey]);

  const shortCount = posts.filter((p) => p.type === 'short').length;
  const longCount = posts.filter((p) => p.type === 'long').length;

  return (
    <section className="space-y-4">
      {/* ✨ 상단 탭 UI */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-6 text-sm">
          <button
            onClick={() => setPrimaryTab('mine')}
            className={`pb-2 border-b-2 -mb-px ${
              primaryTab === 'mine'
                ? 'border-slate-900 font-semibold'
                : 'border-transparent text-slate-500'
            }`}
          >
            내 글
          </button>

          {isMe && (
            <button
              onClick={() => setPrimaryTab('bookmark')}
              className={`pb-2 border-b-2 -mb-px ${
                primaryTab === 'bookmark'
                  ? 'border-slate-900 font-semibold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              북마크
            </button>
          )}
        </div>

        {/* 정렬 버튼 */}
        <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-[13px]">
          {[
            { key: 'latest', label: '최신' },
            { key: 'popular', label: '인기' },
            { key: 'oldest', label: '오래된 순' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSortKey(item.key as SortKey)}
              className={`px-3 py-1.5 rounded-full ${
                sortKey === item.key ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 숏로그/블로그 탭 */}
      <div className="flex gap-6 text-[13px]">
        <button
          onClick={() => setSecondaryTab('short')}
          className={`pb-1 border-b-2 -mb-px ${
            secondaryTab === 'short'
              ? 'border-slate-900 font-semibold'
              : 'border-transparent text-slate-500'
          }`}
        >
          숏로그 <span className="text-slate-400">{shortCount}개</span>
        </button>

        <button
          onClick={() => setSecondaryTab('long')}
          className={`pb-1 border-b-2 -mb-px ${
            secondaryTab === 'long'
              ? 'border-slate-900 font-semibold'
              : 'border-transparent text-slate-500'
          }`}
        >
          블로그 <span className="text-slate-400">{longCount}개</span>
        </button>
      </div>

      {/* ✨ 카드 UI 구현 (ShorlogCard 제거) */}
      {loading ? (
        <div className="mt-8 text-center text-sm text-slate-600">불러오는 중…</div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="mt-8 text-center text-sm text-slate-600">아직 작성한 글이 없어요.</div>
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

// 북마크는 아직 API 없으니 임시 구현
async function getBookmarkedShorlogs(): Promise<ProfileFeedPost[]> {
  return [];
}

async function getBookmarkedBlogs(): Promise<ProfileFeedPost[]> {
  return [];
}
