'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import ShorlogTabs from './ShorlogTabs';
import ShorlogCard from './ShorlogCard';

export type ShorlogTab = 'ai' | 'following';

export type ShorlogItem = {
  id: number;
  thumbnailUrl: string | null;
  profileImgUrl: string;
  nickname: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  firstLine: string;
};

type ShorlogFeedResponse = {
  items: ShorlogItem[];
  nextPage: number | null;
};

// RsData 래퍼 타입
type RsData<T> = {
  resultCode: string;
  msg: string;
  data: T;
};

// Spring Page 응답 타입
type PageResponse<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
};

// ----- Mock 데이터 생성 (보관용) -----
/*
function createMockItems(tab: ShorlogTab, page: number): ShorlogItem[] {
  const baseFirstLines =
    tab === 'ai'
      ? [
        'AI가 뽑은 오늘의 집중력 명언 한 줄',
        '5분만에 읽는 딥워크 실천 가이드',
        '퇴근 후 1시간, 사이드 프로젝트 루틴',
        '아이디어가 떠오르지 않을 때 해야 할 것들',
        '번아웃 직전, 나를 지키는 체크리스트',
        '아침 루틴을 망치는 3가지 작은 습관',
      ]
      : [
        '팔로잉한 작가의 신작 숏로그',
        '내가 좋아하는 개발자의 오늘의 회고',
        '디자이너가 기록한 작은 픽셀 로그',
        '사이드 프로젝트 팀의 데일리 노트',
        '기록 덕분에 바뀐 나의 하루',
        '꾸준함을 만드는 아주 작은 장치들',
      ];

  const hashtagsPool =
    tab === 'ai'
      ? ['#집중력', '#딥워크', '#생산성', '#데일리로그', '#자기계발', '#루틴']
      : ['#팔로잉', '#일상기록', '#개발로그', '#디자인', '#프로덕트', '#사이드프로젝트'];

  return Array.from({ length: 12 }).map((_, index) => {
    const uniqueId = page * 12 + index;
    const base = baseFirstLines[index % baseFirstLines.length];

    return {
      id: uniqueId,
      thumbnailUrl: `https://images.pexels.com/photos/${1500000 + index}?auto=compress&cs=tinysrgb&w=600`,
      profileImgUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${tab}-${uniqueId}`,
      nickname: tab === 'ai' ? `creator_${index + 1}` : `following_user_${index + 1}`,
      hashtags: [
        hashtagsPool[index % hashtagsPool.length],
        hashtagsPool[(index + 2) % hashtagsPool.length],
      ],
      likeCount: 15 + page * 3 + index,
      commentCount: 2 + (index % 5),
      firstLine: base,
    };
  });
}

async function fetchShorlogFeedMock(tab: ShorlogTab, page: number): Promise<ShorlogFeedResponse> {
  await new Promise((res) => setTimeout(res, 550));
  const hasMore = page < 2;
  const items = hasMore ? createMockItems(tab, page) : [];
  return {
    items,
    nextPage: hasMore ? page + 1 : null,
  };
}
*/

// ----- 실제 API 연동 -----
async function fetchShorlogFeed(tab: ShorlogTab, page: number): Promise<ShorlogFeedResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const endpoint = tab === 'ai'
    ? `${API_URL}/api/v1/shorlog/feed?page=${page}`
    : `${API_URL}/api/v1/shorlog/following?page=${page}`;

  const res = await fetch(endpoint, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch shorlog feed: ${res.status}`);
  }

  const rsData: RsData<PageResponse<ShorlogItem>> = await res.json();
  const pageData = rsData.data;

  return {
    items: pageData.content || [],
    nextPage: !pageData.last ? page + 1 : null,
  };
}

// ----- 메인 클라이언트 컴포넌트 -----
export default function ShorlogFeedPageClient() {
  const [activeTab, setActiveTab] = useState<ShorlogTab>('ai');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['shorlog-feed', activeTab],
    queryFn: ({ pageParam }) => fetchShorlogFeed(activeTab, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  const { ref: sentinelRef, inView } = useInView({
    rootMargin: '200px',
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const isEmpty = !isLoading && items.length === 0;

  return (
    <section aria-label="숏 피드">
      <ShorlogTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4 md:mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner label="숏로그를 불러오는 중입니다" />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <div
              className="
                grid grid-cols-2 gap-4 pt-2
                md:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
                2xl:grid-cols-6
              "
            >
              {items.map((item) => (
                <ShorlogCard key={item.id} item={item} />
              ))}
            </div>

            <div ref={sentinelRef} className="h-10 w-full" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-6">
                <LoadingSpinner label="더 많은 숏로그를 불러오는 중입니다" size="sm" />
              </div>
            )}

            {!hasNextPage && items.length > 0 && (
              <p className="mt-6 text-center text-xs text-slate-400">
                끝까지 둘러보셨네요 👀 더 많은 숏로그는 곧 업데이트될 예정이에요.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ----- 서브 컴포넌트들 -----
type LoadingSpinnerProps = {
  label?: string;
  size?: 'md' | 'sm';
};

function LoadingSpinner({ label = '로딩 중입니다', size = 'md' }: LoadingSpinnerProps) {
  const dimension = size === 'md' ? 'h-7 w-7' : 'h-5 w-5';

  return (
    <div className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <div
        className={`${dimension} animate-spin rounded-full border-[3px] border-sky-300 border-t-transparent`}
      />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-100 bg-rose-50/40 px-4 py-10 text-center">
      <p className="text-sm font-medium text-rose-700">
        숏로그를 불러오는 중 문제가 발생했어요.
      </p>
      <p className="mt-1 text-xs text-rose-500">
        네트워크 상태를 확인하시고 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
      >
        다시 시도
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
        <span className="text-lg">✏️</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-800">
        아직 볼 수 있는 숏로그가 없어요.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        첫 숏로그를 남기거나, 더 많은 작가를 팔로우해 보세요.
      </p>
      <button
        type="button"
        className="mt-4 inline-flex items-center rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50"
      >
        새 숏로그 쓰기
      </button>
    </div>
  );
}
