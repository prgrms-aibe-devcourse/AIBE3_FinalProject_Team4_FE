'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { follow, unfollow, isFollowing } from '../followApi';
import { useRouter } from 'next/navigation';

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
        const confirmLogin = window.confirm(
          '팔로우 기능은 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?'
        );
        if (confirmLogin) {
          router.push('/auth/login');
        }
      } else if (!errorMessage.includes('서버 오류')) {
        // 서버 오류가 아닌 경우에만 사용자에게 알림
        alert(`팔로우 처리에 실패했어요.\n\n${errorMessage}`);
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
        alert(`언팔로우 처리에 실패했어요.\n\n${errorMessage}`);
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

