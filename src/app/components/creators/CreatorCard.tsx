'use client';

import { useFollow } from '@/src/hooks/useFollow';
import Link from 'next/link';

export type Creator = {
  id: number;
  nickname: string;
  profileImgUrl: string;
  followersCount: number;
  isFollowing: boolean;
  popularThumbnailUrl: string;
};

export default function CreatorCard({ creator, myId }: { creator: Creator; myId: number }) {
  const { isFollowing, loading, toggleFollow } = useFollow(creator.id, creator.isFollowing);

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
      {/* Thumbnail */}
      <div className="aspect-[3/4] relative w-full">
        <img
          src={creator.popularThumbnailUrl || creator.profileImgUrl || '/tmpProfile.png'}
          alt={`${creator.nickname} 대표 썸네일`}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 opacity-90"
        />

        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center w-full px-4">
          {/* Profile Image */}
          <div className="mx-auto h-14 w-14 rounded-full overflow-hidden border-white shadow">
            <img
              src={creator.profileImgUrl || '/tmpProfile.png'}
              alt={`${creator.nickname} 프로필`}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Nickname */}
          <p className="mt-2 text-white font-semibold text-xl">{creator.nickname}</p>

          {/* Follow Button - hide if it's my profile */}
          {creator.id !== myId && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFollow();
              }}
              disabled={loading}
              className={`
                mt-3 w-32 py-1.5 rounded-md text-sm font-medium transition active:scale-[0.97]
                ${
                  isFollowing
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-[#2979FF] text-white hover:bg-blue-600'
                }
              `}
            >
              {loading ? '...' : isFollowing ? '팔로잉' : '팔로우'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
