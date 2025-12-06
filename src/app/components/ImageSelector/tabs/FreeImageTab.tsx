'use client';

import { getPixabayImages, getUnsplashImages } from '@/src/api/blogImageApi';
import { SearchField } from '@/src/app/components/common/SearchField';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AlertCircle, Check, Info, SearchSlash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AiGeneration from '../../ai/generate/AiGeneration';

interface FreeImageTabProps {
  blogContent?: string;
  searchKeyword: string;
  onSearchKeywordChange: (keyword: string) => void;
  originalImage: string | null;
  onSelect: (url: string | null) => void;
  apiEndpoint?: 'unsplash' | 'pixabay';
}

const PAGE_SIZE = 20;
const MAX_IMAGES = 300;

export default function FreeImageTab({
  blogContent,
  searchKeyword,
  onSearchKeywordChange,
  originalImage,
  onSelect,
  apiEndpoint = 'unsplash',
}: FreeImageTabProps) {
  const [keyword, setKeyword] = useState(searchKeyword);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const selectedImageRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: [apiEndpoint, searchKeyword],
      queryFn: async ({ pageParam = 0 }) => {
        if (!searchKeyword) {
          return {
            content: [],
            last: true,
            totalPages: 0,
            number: 0,
          };
        }
        const res = await (apiEndpoint === 'pixabay'
          ? getPixabayImages(searchKeyword, pageParam, PAGE_SIZE)
          : getUnsplashImages(searchKeyword, pageParam, PAGE_SIZE));
        if (!res.ok) throw new Error('이미지 불러오기에 실패했습니다');
        const json = await res.json();
        return {
          content: json?.data?.content || [],
          last: json?.data?.last ?? false,
          totalPages: json?.data?.totalPages,
          number: json?.data?.number ?? pageParam,
        };
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined;
        if (typeof lastPage.totalPages === 'number' && lastPage.number + 1 >= lastPage.totalPages)
          return undefined;
        return lastPage.number + 1;
      },
      initialPageParam: 0,
      staleTime: 5 * 60 * 1000,
    });

  let images =
    data?.pages.flatMap((page) =>
      page.content
        .map((c: any) => ({
          url: c?.url,
          width: c?.width,
          height: c?.height,
        }))
        .filter((img: any) => img.url && !failedImages.has(img.url)),
    ) || [];

  // 이미지가 100개를 넘으면 더 이상 불러오지 않음
  const shouldFetchMore = images.length + PAGE_SIZE < MAX_IMAGES && hasNextPage;

  function distributeMasonry(images: any[], columnCount: number) {
    const columns = Array.from({ length: columnCount }, () => [] as typeof images);
    const heights = Array.from({ length: columnCount }, () => 0);
    let tieBreaker = 0;

    images.forEach((img) => {
      const ratio = img.width && img.height ? img.height / img.width : 1; // 기본 1 → 0 방지
      const estimatedHeight = ratio; // 너비 동일 가정이면 비율만 누적해도 충분

      const minHeight = Math.min(...heights);
      const minCols = heights.map((h, i) => (h === minHeight ? i : -1)).filter((i) => i !== -1);

      // 동률이면 순환 선택
      const colIndex = minCols[tieBreaker % minCols.length];
      tieBreaker++;

      columns[colIndex].push(img);
      heights[colIndex] += estimatedHeight;
    });

    return columns;
  }

  const columnCount = 3;
  const columns = distributeMasonry(images, columnCount);

  const onSearch = () => {
    if (keyword.trim()) {
      onSearchKeywordChange(keyword.trim());
    }
  };

  // searchKeyword가 외부에서 변경되면 keyword도 동기화
  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  // 검색어가 변경되면 실패한 이미지 목록 초기화 및 스크롤을 맨 위로
  useEffect(() => {
    if (searchKeyword) {
      setFailedImages(new Set());
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [searchKeyword]);

  // 선택된 이미지로 스크롤
  useEffect(() => {
    if (selectedImageRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = selectedImageRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const offset = elementRect.top - containerRect.top + scrollTop - 12; // 12px 여백

      container.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }, [originalImage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetchingNextPage && shouldFetchMore) {
          fetchNextPage();
        }
      },
      { root: scrollContainerRef.current, rootMargin: '200px 0px', threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, isFetchingNextPage, shouldFetchMore]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <SearchField
          id="image-search"
          value={keyword}
          onChange={(value) => {
            setKeyword(value);
          }}
          onSearch={onSearch}
          placeholder="이미지 검색어를 입력하세요"
        />
        {/* AI 키워드 생성기 */}
        <AiGeneration
          mode="keyword"
          contentType="blog"
          content={blogContent}
          onApply={(value) => {
            setKeyword(value);
            onSearchKeywordChange(value);
          }}
        />
      </div>

      {isError && (
        <div className="py-8 text-center text-xs text-rose-500 flex items-center justify-center gap-1">
          <AlertCircle className="w-4 h-4 mr-1" />
          {(error as Error)?.message || '오류가 발생했습니다'}
        </div>
      )}

      <div ref={scrollContainerRef} className="max-h-[400px] overflow-y-auto pr-2">
        <div className="relative w-full">
          {/* 스켈레톤 로딩 */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 
              ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="flex gap-3 pt-2 pl-2 h-[88px]">
              {[0, 1, 2].map((i) => {
                return (
                  <div key={i} className={`w-1/3 h-full bg-slate-200 rounded-lg animate-pulse`} />
                );
              })}
            </div>
          </div>
          {/* 이미지 목록 */}
          <div
            className={`transition-opacity duration-300 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
          >
            <div className="flex gap-3 pt-2 pl-2">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex-1 flex flex-col gap-3">
                  {col.map((img, i) => {
                    const isSelected = originalImage === img.url;
                    const aspectRatio =
                      img.width && img.height ? img.width / img.height : undefined;

                    return (
                      <div
                        key={`${img.url}-${i}`}
                        ref={isSelected ? selectedImageRef : null}
                        className="relative"
                      >
                        <img
                          src={img.url}
                          alt={apiEndpoint === 'pixabay' ? 'pixabay' : 'unsplash'}
                          {...(img.width && img.height
                            ? { width: img.width, height: img.height }
                            : {})}
                          style={aspectRatio ? { aspectRatio: aspectRatio.toString() } : undefined}
                          onError={() => setFailedImages((prev) => new Set(prev).add(img.url))}
                          onClick={() => onSelect(isSelected ? null : img.url)}
                          className={`w-full rounded-lg cursor-pointer hover:opacity-80 transition-all ${
                            isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                          }`}
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {isFetchingNextPage && (
              <div className="flex justify-center py-8">
                <div className="w-7 h-7 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            <div ref={sentinelRef} />

            {!isFetchingNextPage && searchKeyword && images.length > 0 && !shouldFetchMore && (
              <div className="pt-8 pb-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <Info className="w-4 h-4 mr-1" />
                {images.length >= MAX_IMAGES
                  ? `최대 ${MAX_IMAGES}개까지 표시됩니다`
                  : '마지막 페이지입니다'}
              </div>
            )}

            {!searchKeyword && (
              <div className="py-8 text-center text-xs text-slate-500">
                검색어를 입력하고 엔터를 눌러 이미지를 찾아보세요
              </div>
            )}

            {searchKeyword && images.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                <SearchSlash className="w-4 h-4 mr-1" />
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
