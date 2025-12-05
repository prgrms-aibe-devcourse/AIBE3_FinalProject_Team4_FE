'use client';

import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import ShorlogDetailPageClient from '../shorlog/detail/ShorlogDetailPageClient';
import type { ShorlogDetail } from '../shorlog/detail/types';
import type { ShorlogItem } from '../shorlog/feed/ShorlogFeedPageClient';

interface Props {
  shorlogId: number;
  profileUserId: string;
  allItems: ShorlogItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (newId: number, newIndex: number) => void;
}

async function fetchShorlogDetail(id: number): Promise<ShorlogDetail> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  const res = await fetch(`${API_BASE_URL}/api/v1/shorlog/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('숏로그를 찾을 수 없습니다.');
    }
    throw new Error('숏로그를 불러오는데 실패했습니다.');
  }

  const rsData = await res.json();
  const data = rsData.data;

  return {
    id: data.id,
    userId: data.userId,
    username: data.username,
    nickname: data.nickname,
    profileImgUrl: data.profileImgUrl ?? null,
    content: data.content,
    thumbnailUrls: data.thumbnailUrls ?? [],
    viewCount: data.viewCount ?? 0,
    likeCount: data.likeCount ?? 0,
    bookmarkCount: data.bookmarkCount ?? 0,
    commentCount: data.commentCount ?? 0,
    hashtags: data.hashtags ?? [],
    createdAt: data.createdAt,
    modifiedAt: data.modifiedAt,
    linkedBlogId: data.linkedBlogId ?? null,
  };
}

export default function ProfileShorlogModal({
  shorlogId,
  allItems,
  currentIndex,
  onClose,
  onNavigate
}: Omit<Props, 'profileUserId'>) {
  const [detail, setDetail] = useState<ShorlogDetail | null>(null);
  const [nextDetail, setNextDetail] = useState<ShorlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // 이전/다음 항목 계산
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allItems.length - 1;
  const prevItem = hasPrev ? allItems[currentIndex - 1] : null;
  const nextItem = hasNext ? allItems[currentIndex + 1] : null;

  // 다음/이전 숏로그 프리페칭 및 캐싱
  useEffect(() => {
    const prefetchAndCache = async (id: number) => {
      try {
        const detail = await fetchShorlogDetail(id);
        // 다음 항목이면 미리 상태에 저장
        if (nextItem && id === nextItem.id) {
          setNextDetail(detail);
        }
      } catch {
        // 프리페칭 실패는 무시
      }
    };

    if (prevItem) prefetchAndCache(prevItem.id);
    if (nextItem) prefetchAndCache(nextItem.id);
  }, [prevItem, nextItem]);

  // 숏로그 상세 정보 로드
  useEffect(() => {
    async function loadDetail() {
      try {
        // 네비게이션 중이면 페이드 아웃 먼저
        if (isNavigating) {
          setFadeOut(true);
          await new Promise(resolve => setTimeout(resolve, 150));
        }

        setLoading(true);
        setError(null);

        // 캐시된 데이터가 있으면 사용
        if (nextDetail && nextDetail.id === shorlogId) {
          setDetail(nextDetail);
          setNextDetail(null);
        } else {
          const shorlogDetail = await fetchShorlogDetail(shorlogId);
          setDetail(shorlogDetail);
        }

        setFadeOut(false);
        setIsNavigating(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '숏로그를 불러오는데 실패했습니다.');
        setIsNavigating(false);
        setFadeOut(false);
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [shorlogId]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  // 네비게이션 핸들러
  const handlePrev = () => {
    if (hasPrev && prevItem && !isNavigating) {
      setIsNavigating(true);
      onNavigate(prevItem.id, currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && nextItem && !isNavigating) {
      setIsNavigating(true);
      onNavigate(nextItem.id, currentIndex + 1);
    }
  };

  // 배경 클릭으로 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/55" />

      {/* 이전/다음 화살표 */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          disabled={isNavigating}
          className="absolute left-4 top-1/2 z-60 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white text-2xl text-slate-700 shadow-xl transition-all duration-200 hover:bg-slate-50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="이전 숏로그"
        >
          {isNavigating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </button>
      )}

      {hasNext && (
        <button
          onClick={handleNext}
          disabled={isNavigating}
          className="absolute right-4 top-1/2 z-60 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white text-2xl text-slate-700 shadow-xl transition-all duration-200 hover:bg-slate-50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="다음 숏로그"
        >
          {isNavigating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
          ) : (
            <ChevronRight className="h-6 w-6" />
          )}
        </button>
      )}

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-60 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        aria-label="모달 닫기"
      >
        <X className="h-5 w-5" />
      </button>

      {/* 모달 컨텐츠 */}
      <div
        className="relative flex h-[90vh] w-full max-w-[1200px] px-4 py-4 md:px-6 md:py-6"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent mx-auto"></div>
              <p className="text-slate-600">숏로그를 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
              >
                닫기
              </button>
            </div>
          </div>
        ) : detail ? (
          <div className="w-full">
            <ShorlogDetailPageClient
              detail={detail}
              isOwner={false}
              hideNavArrows={true}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
