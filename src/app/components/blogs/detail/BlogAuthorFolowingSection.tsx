'use client';

import { useState } from 'react';
import { followUser, unfollowUser } from '@/src/api/follow';
import { handleApiError } from '@/src/lib/handleApiError';
import { showGlobalToast } from '@/src/lib/toastStore';
import type { BlogDetailDto } from '@/src/types/blog';

type Props = {
  blog: BlogDetailDto;
  isOwner: boolean;
  initialIsFollowing: boolean;
};

export function BlogAuthorFollowSection({ blog, isOwner, initialIsFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollowClick = async () => {
    if (followLoading) return;
    if (isOwner) return; // 안전장치

    setFollowLoading(true);

    try {
      if (isFollowing) {
        // 언팔로우
        await unfollowUser(blog.userId);
        setIsFollowing(false);
        showGlobalToast('팔로우를 해제했습니다.', 'success');
      } else {
        // 팔로우
        await followUser(blog.userId);
        setIsFollowing(true);
        showGlobalToast('팔로우 했습니다.', 'success');
      }
    } catch (e) {
      // 공통 에러 처리 + 토스트
      handleApiError(e, isFollowing ? '팔로우 해제' : '팔로우');

      // 낙관적 업데이트 안 했으니까 롤백은 필요 없음
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isOwner && (
        <button
          type="button"
          disabled={followLoading}
          onClick={handleFollowClick}
          className={[
            'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
            isFollowing
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-[#2979FF] text-white hover:bg-[#1f5ecc]',
            followLoading ? 'opacity-70 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {isFollowing ? '팔로잉' : '팔로우'}
        </button>
      )}
    </div>
  );
}
