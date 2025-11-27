'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import FilterTabs from '../../common/FilterTabs';
import SortButton from '../../common/SortButton';
import ShorlogCard from './ShorlogCard';

export type ShorlogFilter = "all" | "following";
export type ShorlogSort = "recommend" | null;

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

// ----- 실제 API 연동 -----
async function fetchShorlogFeed(
  filter: ShorlogFilter,
  sort: ShorlogSort,
  page: number
): Promise<ShorlogFeedResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  let endpoint: string;

  if (filter === 'following') {
    // 팔로우: 항상 최신순
    endpoint = `${API_URL}/api/v1/shorlog/following?page=${page}`;
  } else {
    // 전체: sort에 따라 분기
    if (sort === 'recommend') {
      endpoint = `${API_URL}/api/v1/shorlog/feed/recommended?page=${page}`;
    } else {
      endpoint = `${API_URL}/api/v1/shorlog/feed?page=${page}`;
    }
  }

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
  const [filter, setFilter] = useState<ShorlogFilter>('all');
  const [sort, setSort] = useState<ShorlogSort>('recommend');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['shorlog-feed', filter, sort],
    queryFn: ({ pageParam }) => fetchShorlogFeed(filter, sort, pageParam as number),
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

  const items = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.items) ?? [];
    // ID 중복 제거
    return allItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );
  }, [data]);

  const isEmpty = !isLoading && items.length === 0;

  return (
    <section aria-label="숏 피드">
      <div className="flex items-center justify-between">
        <FilterTabs value={filter} onChange={setFilter} />
        {filter === 'all' && <SortButton value={sort} onChange={setSort} />}
      </div>

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
              {items.map((item, index) => (
                <ShorlogCard key={item.id} item={item} index={index} allItems={items} />
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
