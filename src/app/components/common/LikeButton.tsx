'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { addLike, removeLike, getLikeStatus } from '@/src/api/shorlogLikeApi';
import { handleApiError } from '@/src/lib/handleApiError';

interface LikeButtonProps {
  shorlogId: number;
  authorId?: number; // 작성자 ID (본인 글 확인용)
  initialLiked?: boolean;
  initialLikeCount?: number;
  onLikeChange?: (isLiked: boolean, likeCount: number) => void;
  variant?: 'default' | 'small';
  showCount?: boolean;
}

export default function LikeButton({
  shorlogId,
  authorId,
  initialLiked = false,
  initialLikeCount = 0,
  onLikeChange,
  variant = 'default',
  showCount = true,
}: LikeButtonProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 로그인 상태 및 좋아요 상태 확인
  useEffect(() => {
    const checkAuthAndLikeStatus = async () => {
      try {
        // 현재 사용자 정보 가져오기
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/v1/auth/me`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const json = await response.json();
          const user = json.data;
          setCurrentUserId(user?.id);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setCurrentUserId(null);
        }

        // 좋아요 상태 확인
        const likeStatus = await getLikeStatus(shorlogId);
        setIsLiked(likeStatus.isLiked);
        setLikeCount(likeStatus.likeCount);
      } catch (error) {
        setIsLoggedIn(false);
        // 좋아요 상태 조회 실패 시 초기값 사용
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkAuthAndLikeStatus();
  }, [shorlogId]);

  // 좋아요/좋아요 취소 토글
  const handleToggleLike = async () => {
    // 로그인 확인
    if (!isLoggedIn) {
      const confirmLogin = window.confirm(
        '좋아요 기능은 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?'
      );
      if (confirmLogin) {
        router.push('/auth/login');
      }
      return;
    }

    // 본인 글 확인
    if (authorId && currentUserId === authorId) {
      handleApiError({ message: '본인의 글에는 좋아요할 수 없습니다.' }, '좋아요 처리');
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);

    try {
      let result;
      if (isLiked) {
        result = await removeLike(shorlogId);
      } else {
        result = await addLike(shorlogId);
      }

      setIsLiked(result.isLiked);
      setLikeCount(result.likeCount);
      onLikeChange?.(result.isLiked, result.likeCount);

      // 애니메이션 완료 후 상태 초기화
      setTimeout(() => setIsAnimating(false), 300);
    } catch (error) {
      handleApiError(error, '좋아요 처리');
      setIsAnimating(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중일 때 표시할 컴포넌트
  if (isCheckingStatus) {
    return (
      <div className={`flex items-center gap-1 ${variant === 'small' ? 'text-xs' : 'text-sm'}`}>
        <Heart className={`${variant === 'small' ? 'h-4 w-4' : 'h-5 w-5'} text-slate-300 animate-pulse`} />
        {showCount && <span className="text-slate-300">•</span>}
      </div>
    );
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`
        flex items-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95
        ${variant === 'small' ? 'text-xs' : 'text-sm'}
        ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
      aria-label={isLiked ? '좋아요 취소' : '좋아요'}
    >
      <div className="relative">
        <Heart
          className={`
            ${variant === 'small' ? 'h-4 w-4' : 'h-5 w-5'}
            transition-all duration-200
            ${isLiked 
              ? 'fill-red-500 text-red-500' 
              : 'fill-none text-slate-500 hover:text-red-400'
            }
            ${isAnimating ? 'animate-bounce' : ''}
          `}
        />

        {/* 좋아요 애니메이션 효과 */}
        {isAnimating && isLiked && (
          <div className="absolute inset-0 animate-ping">
            <Heart className={`
              ${variant === 'small' ? 'h-4 w-4' : 'h-5 w-5'}
              fill-red-300 text-red-300 opacity-75
            `} />
          </div>
        )}
      </div>

      {showCount && (
        <span className={`
          font-medium transition-colors duration-200
          ${isLiked ? 'text-red-500' : 'text-slate-600'}
        `}>
          {likeCount.toLocaleString()}
        </span>
      )}
    </button>
  );
}
