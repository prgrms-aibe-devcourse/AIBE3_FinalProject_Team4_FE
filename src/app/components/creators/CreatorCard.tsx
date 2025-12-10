'use client';

import { useFollowMutation, useFollowStatus } from '@/src/hooks/useFollow';
import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type Creator = {
  id: number;
  nickname: string;
  profileImgUrl: string;
  followersCount: number;
  isFollowing: boolean;
  popularThumbnailUrl: string;
};

export default function CreatorCard({ creator }: { creator: Creator }) {
  const { loginUser, isLogin } = useAuth();
  const { open } = useLoginModal();
  const router = useRouter();

  // 팔로우 상태 (서버에서 가져온 값 우선, 없으면 초기값 사용)
  const { data: isFollowingFromServer } = useFollowStatus(creator.id, loginUser?.id ?? null);
  const isFollowing = isFollowingFromServer ?? creator.isFollowing;

  // 팔로우/언팔로우 뮤테이션
  const { followMutation, unfollowMutation } = useFollowMutation(creator.id, loginUser?.id ?? null);

  const handleFollowToggle = async () => {
    // ✅ 로그인 안 했으면 바로 로그인 모달
    if (!isLogin) {
      open();
      return;
    }

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync();
      } else {
        await followMutation.mutateAsync();
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
    }
  };

  return (
    <Link
      href={`/profile/${creator.id}`}
      className="
        group relative overflow-hidden rounded-2xl
        bg-white shadow-sm ring-1 ring-slate-100
        transition-all hover:-translate-y-1 hover:shadow-lg
        cursor-pointer
      "
    >
      <div className="aspect-[4/5] relative w-full">
        <img
          src={creator.popularThumbnailUrl || creator.profileImgUrl || '/tmpProfile.png'}
          alt={`${creator.nickname} 대표 썸네일`}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 opacity-90"
        />

        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center w-full px-4">
          <div className="mx-auto h-14 w-14 rounded-full overflow-hidden border-white shadow">
            <img
              src={creator.profileImgUrl || '/tmpProfile.png'}
              alt={`${creator.nickname} 프로필`}
              className="h-full w-full object-cover"
            />
          </div>

          <p className="mt-2 text-white font-semibold text-xl">{creator.nickname}</p>

          {loginUser?.id !== creator.id && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFollowToggle();
              }}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              className={`
                mt-3 w-32 py-1.5 rounded-md text-sm font-medium transition active:scale-[0.97]
                disabled:cursor-not-allowed disabled:opacity-50
                ${
                  isFollowing
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-[#2979FF] text-white hover:bg-blue-600'
                }
              `}
            >
              {followMutation.isPending || unfollowMutation.isPending
                ? '처리중...'
                : isFollowing
                  ? '팔로잉'
                  : '팔로우'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
