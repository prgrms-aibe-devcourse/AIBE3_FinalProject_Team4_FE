'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { follow, unfollow, isFollowing } from '../api/followApi';
import { useRouter } from 'next/navigation';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useState } from 'react';

// 팔로우 상태 조회 훅
export function useFollowStatus(userId: number, currentUserId: number | null) {
  return useQuery({
    queryKey: ['follow-status', currentUserId, userId],
    queryFn: () => isFollowing(userId),
    enabled: !!(currentUserId && currentUserId !== userId),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && (error.message.includes('로그인') || error.message.includes('권한'))) {
        return false;
      }
      return failureCount < 2; // 최대 2번 재시도
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

// 팔로우/언팔로우 뮤테이션 훅
export function useFollowMutation(userId: number, currentUserId: number | null) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const followMutation = useMutation({
    mutationFn: () => follow(userId),
    onMutate: async () => {
      // 현재 사용자 ID가 있는 경우에만 낙관적 업데이트
      if (currentUserId) {
        const queryKey = ['follow-status', currentUserId, userId];
        await queryClient.cancelQueries({ queryKey });

        const previousStatus = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, true);

        return { previousStatus, queryKey };
      }
      return { previousStatus: undefined, queryKey: null };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      if (context?.previousStatus !== undefined && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousStatus);
      }

      const errorMessage = error instanceof Error ? error.message : '팔로우에 실패했습니다.';

      // 로그인 관련 에러는 특별 처리
      if (errorMessage.includes('로그인')) {
        showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
      } else if (!errorMessage.includes('서버 오류')) {
        // 서버 오류가 아닌 경우에만 사용자에게 알림
        showGlobalToast(`팔로우 처리에 실패했어요. ${errorMessage}`, 'error');
      }

      console.error('팔로우 실패:', { userId, error: errorMessage });
    },
    onSuccess: () => {
      // 성공 시 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: ['follow'],
        exact: false
      });
    },
    onSettled: () => {
      // 뮤테이션 완료 후 해당 사용자의 팔로우 상태 쿼리 무효화
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: ['follow-status', currentUserId, userId]
        });
      }
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollow(userId),
    onMutate: async () => {
      // 현재 사용자 ID가 있는 경우에만 낙관적 업데이트
      if (currentUserId) {
        const queryKey = ['follow-status', currentUserId, userId];
        await queryClient.cancelQueries({ queryKey });

        const previousStatus = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, false);

        return { previousStatus, queryKey };
      }
      return { previousStatus: undefined, queryKey: null };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      if (context?.previousStatus !== undefined && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousStatus);
      }

      const errorMessage = error instanceof Error ? error.message : '언팔로우에 실패했습니다.';

      if (!errorMessage.includes('서버 오류')) {
        // 서버 오류가 아닌 경우에만 사용자에게 알림
        showGlobalToast(`언팔로우 처리에 실패했어요. ${errorMessage}`, 'error');
      }

      console.error('언팔로우 실패:', { userId, error: errorMessage });
    },
    onSuccess: () => {
      // 성공 시 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: ['follow'],
        exact: false
      });
    },
    onSettled: () => {
      // 뮤테이션 완료 후 해당 사용자의 팔로우 상태 쿼리 무효화
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: ['follow-status', currentUserId, userId]
        });
      }
    },
  });

  return {
    followMutation,
    unfollowMutation,
  };
}

/**
 * 간단한 팔로우 훅 (팀원 제공)
 * React Query를 사용하지 않는 경우나 간단한 용도로 사용
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useFollow(userId: number, initialIsFollowing: boolean) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    if (loading) return;

    const newState = !isFollowing;
    setIsFollowing(newState); // optimistic update
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/follow/${userId}`, {
        method: newState ? 'POST' : 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 성공 시 토스트 표시
      if (newState) {
        showGlobalToast('팔로우했습니다.', 'success');
      } else {
        showGlobalToast('언팔로우했습니다.', 'success');
      }
    } catch (e) {
      console.error('팔로우 토글 실패:', e);
      setIsFollowing(!newState); // rollback on error

      // 에러 토스트 표시
      const errorMessage = e instanceof Error ? e.message : '팔로우 처리 중 오류가 발생했습니다.';
      if (errorMessage.includes('로그인') || errorMessage.includes('401')) {
        showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
      } else {
        showGlobalToast('팔로우 처리에 실패했습니다.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    loading,
    toggleFollow,
    setIsFollowing,
  };
}
