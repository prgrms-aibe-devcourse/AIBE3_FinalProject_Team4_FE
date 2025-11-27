'use client';

import { getGoogleImages, getUnsplashImages } from '@/src/api/blogImageApi';
import { SearchField } from '@/src/app/components/common/SearchField';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface UnsplashImagePickerProps {
  searchKeyword: string;
  onSearchKeywordChange: (keyword: string) => void;
  selectedImage: string | null;
  originalImage: string | null;
  onSelect: (url: string) => void;
  apiEndpoint?: 'unsplash' | 'google';
}

const PAGE_SIZE = 20;
const MAX_IMAGES = 300;

export default function UnsplashImagePicker({
  searchKeyword,
  onSearchKeywordChange,
  selectedImage,
  originalImage,
  onSelect,
  apiEndpoint = 'unsplash',
}: UnsplashImagePickerProps) {
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
        const res = await (apiEndpoint === 'google'
          ? getGoogleImages(searchKeyword, pageParam, PAGE_SIZE)
          : getUnsplashImages(searchKeyword, pageParam, PAGE_SIZE));
        if (!res.ok) throw new Error('이미지 검색에 실패했습니다.');
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

  const images =
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
      <div className="mb-4">
        <SearchField
          id="image-search"
          value={keyword}
          onChange={(value) => {
            setKeyword(value);
            if (value === '') onSearch();
          }}
          onSearch={onSearch}
          placeholder="이미지 검색어를 입력하세요"
        />
      </div>

      {isError && (
        <div className="mb-3 text-sm text-red-500">
          {(error as Error)?.message || '오류가 발생했습니다.'}
        </div>
      )}

      <div ref={scrollContainerRef} className="max-h-[400px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-3 pt-2 pl-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const heights = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[1/1]', 'aspect-[3/5]'];
              const randomHeight = heights[i % heights.length];
              return (
                <div key={i} className="relative mb-3 break-inside-avoid">
                  <div className={`w-full ${randomHeight} bg-gray-200 rounded-lg animate-pulse`} />
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3 pt-2 pl-2">
              {images.map((img, i) => {
                const isSelected = originalImage === img.url;
                const aspectRatio = img.width && img.height ? img.width / img.height : undefined;
                return (
                  <div
                    key={`${img.url}-${i}`}
                    ref={isSelected ? selectedImageRef : null}
                    className="relative mb-3 break-inside-avoid"
                  >
                    <img
                      src={img.url}
                      alt={apiEndpoint === 'google' ? 'google' : 'unsplash'}
                      {...(img.width && img.height ? { width: img.width, height: img.height } : {})}
                      style={aspectRatio ? { aspectRatio: aspectRatio.toString() } : undefined}
                      onError={() => {
                        setFailedImages((prev) => new Set(prev).add(img.url));
                      }}
                      onClick={() => {
                        if (!isSelected) {
                          onSelect(img.url);
                        }
                      }}
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

            {isFetchingNextPage && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            <div ref={sentinelRef} />

            {!isFetchingNextPage && searchKeyword && images.length > 0 && !shouldFetchMore && (
              <div className="pt-8 pb-4 text-center text-sm text-gray-400">
                {images.length >= MAX_IMAGES
                  ? `최대 ${MAX_IMAGES}개까지 표시됩니다`
                  : '마지막 페이지입니다'}
              </div>
            )}

            {!searchKeyword && (
              <div className="py-8 text-center text-sm text-gray-500">
                검색어를 입력하고 검색을 눌러 이미지를 찾아보세요
              </div>
            )}

            {searchKeyword && images.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">검색 결과가 없습니다</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
