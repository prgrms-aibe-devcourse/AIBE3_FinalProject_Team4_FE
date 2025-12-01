'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { follow, unfollow, isFollowing } from '@/src/api/followApi';
import LoadingSpinner from './LoadingSpinner';

interface FollowButtonProps {
  userId: number;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: 'default' | 'small';
}

export default function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  variant = 'default',
}: FollowButtonProps) {
  const router = useRouter();
  const [isFollowingState, setIsFollowingState] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 사용자 정보 및 팔로우 상태 확인
  useEffect(() => {
    const checkAuthAndFollow = async () => {
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

          // 본인이 아닌 경우에만 팔로우 상태 확인
          if (user?.id && user.id !== userId) {
            try {
              const followStatus = await isFollowing(userId);
              setIsFollowingState(followStatus);
            } catch (followError) {
              // 팔로우 상태 확인 실패 시 기본값 false로 설정
              setIsFollowingState(false);
            }
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {

        setIsLoggedIn(false);
      } finally {
        setIsCheckingFollow(false);
      }
    };

    checkAuthAndFollow();
  }, [userId]);

  // 팔로우/언팔로우 토글
  const handleToggleFollow = async () => {
    // 로그인 확인
    if (!isLoggedIn) {
      const confirmLogin = window.confirm(
        '팔로우 기능은 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?'
      );
      if (confirmLogin) {
        router.push('/auth/login');
      }
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowingState) {
        await unfollow(userId);
        setIsFollowingState(false);
        onFollowChange?.(false);
      } else {
        await follow(userId);
        setIsFollowingState(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      // 더 구체적인 에러 메시지 표시
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`${isFollowingState ? '언팔로우' : '팔로우'} 처리에 실패했어요.\n\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 본인이면 표시하지 않음
  if (currentUserId === userId) {
    return null;
  }

  // 로딩 중
  if (isCheckingFollow) {
    return (
      <button
        disabled
        className={`
          flex items-center justify-center rounded-full border border-slate-200 bg-white
          ${variant === 'small' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
          font-medium text-slate-400 cursor-not-allowed
        `}
      >
        <LoadingSpinner size="sm" inline />
      </button>
    );
  }

  // 비로그인 상태에서는 팔로우 버튼 표시
  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2 rounded-full border transition
        ${variant === 'small' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
        font-medium
        ${
          isFollowingState
            ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600'
            : 'border-[#2979FF] bg-[#2979FF] text-white hover:bg-[#1f63d1]'
        }
        disabled:cursor-not-allowed disabled:opacity-50
      `}
    >
      {isLoading && <LoadingSpinner size="sm" inline theme={isFollowingState ? 'default' : 'light'} />}
      {isFollowingState ? '팔로잉' : '팔로우'}
    </button>
  );
}

