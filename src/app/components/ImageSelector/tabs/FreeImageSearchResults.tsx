import { getPixabayImages, getUnsplashImages } from '@/src/api/blogImageApi';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AlertCircle, Check, Info, SearchSlash } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const PAGE_SIZE = 20;
const MAX_IMAGES = 200;

interface FreeImageSearchResultsProps {
  apiEndpoint: 'unsplash' | 'pixabay';
  searchKeyword: string;
  originalImageId: string | null;
  onSelect: (url: string | null, id: string | null) => void;
}

export default function FreeImageSearchResults({
  apiEndpoint = 'pixabay',
  searchKeyword,
  originalImageId,
  onSelect,
}: FreeImageSearchResultsProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const selectedImageRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;

    const el = scrollContainerRef.current;

    const update = () => setContainerWidth(el.clientWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const columnCount = useMemo(() => {
    if (containerWidth < 520) return 2; // 작은 화면 2
    if (containerWidth < 900) return 3; // 대부분 노트북/태블릿 3
    return 4; // 매우 넓으면 4
  }, [containerWidth]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: [apiEndpoint, searchKeyword],
      enabled: !!searchKeyword.trim(), // 검색어 있을 때만 실행
      queryFn: async ({ pageParam = 0 }) => {
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
          id: c?.id,
          url: c?.url,
          width: c?.width,
          height: c?.height,
        }))
        .filter((img: any) => img.url && !failedImages.has(img.url)),
    ) || [];

  // 이미지가 100개를 넘으면 더 이상 불러오지 않음
  const shouldFetchMore = images.length + PAGE_SIZE < MAX_IMAGES && hasNextPage;

  function distributeMasonry(images: any[], columnCount: number) {
    // --- 중복 제거 ---
    const seen = new Set<string | number>();
    const dedupedImages = images.filter((img) => {
      const key = img.id ?? img.url; // id 없으면 url로
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const columns = Array.from({ length: columnCount }, () => [] as typeof images);
    const heights = Array.from({ length: columnCount }, () => 0);
    let tieBreaker = 0;

    dedupedImages.forEach((img) => {
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

  const columns = distributeMasonry(images, columnCount);

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
  }, [originalImageId]);

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
    <>
      <div ref={scrollContainerRef} className="max-h-[400px] overflow-y-auto pr-2">
        <div className="relative w-full">
          {isError && (
            <div className="py-8 text-center text-xs text-rose-500 flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4 mr-1" />
              {(error as Error)?.message || '오류가 발생했습니다'}
            </div>
          )}

          {!isError && !searchKeyword && (
            <div className="py-8 text-center text-xs text-slate-500">
              검색어를 입력하고 엔터를 눌러 이미지를 찾아보세요
            </div>
          )}

          {!isError && searchKeyword && !isLoading && images.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
              <SearchSlash className="w-4 h-4 mr-1" />
              검색 결과가 없습니다
            </div>
          )}

          {searchKeyword && isLoading && (
            <div className="py-8 text-center text-xs text-slate-500">검색 중...</div>
          )}

          {/* 이미지 목록 */}
          {!isLoading && (
            <div>
              <div className="flex gap-3 pt-2 pl-2">
                {columns.map((col, colIdx) => (
                  <div key={colIdx} className="flex-1 flex flex-col gap-3">
                    {col.map((img, i) => {
                      const isSelected = originalImageId === img.id;
                      const aspectRatio =
                        img.width && img.height ? img.width / img.height : undefined;

                      return (
                        <div
                          key={`${img.id}-${i}`}
                          ref={isSelected ? selectedImageRef : null}
                          className="relative"
                        >
                          <img
                            src={img.url}
                            alt={apiEndpoint === 'pixabay' ? 'pixabay' : 'unsplash'}
                            {...(img.width && img.height
                              ? { width: img.width, height: img.height }
                              : {})}
                            style={
                              aspectRatio ? { aspectRatio: aspectRatio.toString() } : undefined
                            }
                            onError={() => setFailedImages((prev) => new Set(prev).add(img.url))}
                            onClick={() =>
                              onSelect(isSelected ? null : img.url, isSelected ? null : img.id)
                            }
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}
