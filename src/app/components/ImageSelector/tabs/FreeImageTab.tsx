'use client';

import { useEffect, useState } from 'react';
import ImageMasonry from '../ImageMasonry';
import SearchWithAi from '../SearchWithAi';

interface FreeImageTabProps {
  selectedTab: 'upload' | 'blog' | 'unsplash' | 'pixabay';
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
  selectedTab,
  blogContent,
  searchKeyword,
  onSearchKeywordChange,
  originalImage,
  onSelect,
  apiEndpoint = 'unsplash',
}: FreeImageTabProps) {
  // searchKeyword는 검색어, 검색어 엔터 쳐야 검색되게 따로 관리
  const [keyword, setKeyword] = useState(searchKeyword);
  // const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // const scrollContainerRef = useRef<HTMLDivElement>(null);
  // const sentinelRef = useRef<HTMLDivElement>(null);
  // const selectedImageRef = useRef<HTMLDivElement>(null);

  // const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
  //   useInfiniteQuery({
  //     queryKey: [apiEndpoint, searchKeyword],
  //     queryFn: async ({ pageParam = 0 }) => {
  //       if (!searchKeyword) {
  //         return {
  //           content: [],
  //           last: true,
  //           totalPages: 0,
  //           number: 0,
  //         };
  //       }
  //       const res = await (apiEndpoint === 'pixabay'
  //         ? getPixabayImages(searchKeyword, pageParam, PAGE_SIZE)
  //         : getUnsplashImages(searchKeyword, pageParam, PAGE_SIZE));
  //       if (!res.ok) throw new Error('이미지 불러오기에 실패했습니다');
  //       const json = await res.json();
  //       return {
  //         content: json?.data?.content || [],
  //         last: json?.data?.last ?? false,
  //         totalPages: json?.data?.totalPages,
  //         number: json?.data?.number ?? pageParam,
  //       };
  //     },
  //     getNextPageParam: (lastPage) => {
  //       if (lastPage.last) return undefined;
  //       if (typeof lastPage.totalPages === 'number' && lastPage.number + 1 >= lastPage.totalPages)
  //         return undefined;
  //       return lastPage.number + 1;
  //     },
  //     initialPageParam: 0,
  //     staleTime: 5 * 60 * 1000,
  //   });

  // let images =
  //   data?.pages.flatMap((page) =>
  //     page.content
  //       .map((c: any) => ({
  //         url: c?.url,
  //         width: c?.width,
  //         height: c?.height,
  //       }))
  //       .filter((img: any) => img.url && !failedImages.has(img.url)),
  //   ) || [];

  // // 이미지가 100개를 넘으면 더 이상 불러오지 않음
  // const shouldFetchMore = images.length + PAGE_SIZE < MAX_IMAGES && hasNextPage;

  // function distributeMasonry(images: any[], columnCount: number) {
  //   const columns = Array.from({ length: columnCount }, () => [] as typeof images);
  //   const heights = Array.from({ length: columnCount }, () => 0);
  //   let tieBreaker = 0;

  //   images.forEach((img) => {
  //     const ratio = img.width && img.height ? img.height / img.width : 1; // 기본 1 → 0 방지
  //     const estimatedHeight = ratio; // 너비 동일 가정이면 비율만 누적해도 충분

  //     const minHeight = Math.min(...heights);
  //     const minCols = heights.map((h, i) => (h === minHeight ? i : -1)).filter((i) => i !== -1);

  //     // 동률이면 순환 선택
  //     const colIndex = minCols[tieBreaker % minCols.length];
  //     tieBreaker++;

  //     columns[colIndex].push(img);
  //     heights[colIndex] += estimatedHeight;
  //   });

  //   return columns;
  // }

  // const columnCount = 3;
  // const columns = distributeMasonry(images, columnCount);

  // searchKeyword가 외부에서 변경되면 keyword도 동기화
  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  // // 검색어가 변경되면 실패한 이미지 목록 초기화 및 스크롤을 맨 위로
  // useEffect(() => {
  //   if (searchKeyword) {
  //     setFailedImages(new Set());
  //     if (scrollContainerRef.current) {
  //       scrollContainerRef.current.scrollTop = 0;
  //     }
  //   }
  // }, [searchKeyword]);

  // // 선택된 이미지로 스크롤
  // useEffect(() => {
  //   if (selectedImageRef.current && scrollContainerRef.current) {
  //     const container = scrollContainerRef.current;
  //     const element = selectedImageRef.current;
  //     const containerRect = container.getBoundingClientRect();
  //     const elementRect = element.getBoundingClientRect();
  //     const scrollTop = container.scrollTop;
  //     const offset = elementRect.top - containerRect.top + scrollTop - 12; // 12px 여백

  //     container.scrollTo({ top: offset, behavior: 'smooth' });
  //   }
  // }, [originalImage]);

  // useEffect(() => {
  //   const sentinel = sentinelRef.current;
  //   if (!sentinel) return;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       const first = entries[0];
  //       if (first.isIntersecting && !isFetchingNextPage && shouldFetchMore) {
  //         fetchNextPage();
  //       }
  //     },
  //     { root: scrollContainerRef.current, rootMargin: '200px 0px', threshold: 0.1 },
  //   );

  //   observer.observe(sentinel);
  //   return () => observer.disconnect();
  // }, [fetchNextPage, isFetchingNextPage, shouldFetchMore]);

  return (
    <>
      <SearchWithAi
        keyword={keyword}
        setKeyword={setKeyword}
        blogContent={blogContent}
        onSearchKeywordChange={onSearchKeywordChange}
      />
      {selectedTab === 'unsplash' && (
        <ImageMasonry
          // keyword={keyword}
          // columns={columns}
          originalImage={originalImage}
          // selectedImageRef={selectedImageRef}
          // scrollContainerRef={scrollContainerRef}
          // failedImages={failedImages}
          // setFailedImages={setFailedImages}
          onSelect={onSelect}
          apiEndpoint="unsplash"
          // isError={isError}
          // error={error}
          // isLoading={isLoading}
          // isFetchingNextPage={isFetchingNextPage}
          // shouldFetchMore={shouldFetchMore}
          searchKeyword={searchKeyword}
          // images={images}
          // MAX_IMAGES={MAX_IMAGES}
          // sentinelRef={sentinelRef}
        />
      )}

      {selectedTab === 'pixabay' && (
        <ImageMasonry
          searchKeyword={searchKeyword}
          apiEndpoint="pixabay"
          originalImage={originalImage}
          onSelect={onSelect}
        />
      )}
    </>
  );
}
