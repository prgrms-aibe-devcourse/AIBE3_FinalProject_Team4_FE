'use client';

import { useFollow } from '@/src/hooks/useFollow';
import Link from 'next/link';

interface FollowListItemProps {
  user: any;
  myId: number;
  onToggleFollow?: (targetUserId: number, nextIsFollowing: boolean) => void;
}

export default function FollowListItem({ user, myId, onToggleFollow }: FollowListItemProps) {
  const { isFollowing, loading, toggleFollow } = useFollow(user.id, user.isFollowing);

  return (
    <li>
      <Link href={`/profile/${user.id}`} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user.profileImgUrl || '/tmpProfile.png'}
            alt={`${user.nickname} 프로필`}
            className="w-12 h-12 rounded-full object-cover bg-slate-200"
          />
          <p className="font-semibold text-[15px]">{user.nickname}</p>
        </div>

        {user.id !== myId && (
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              const next = !isFollowing;
              // 부모에 먼저 알림 (모달 카운트 즉시 업데이트)
              onToggleFollow?.(user.id, next);
              // 그 다음 API 호출
              await toggleFollow();
            }}
            disabled={loading}
            className={`
              px-4 py-1.5 rounded-md text-xs transition
              ${
                isFollowing
                  ? 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                  : 'bg-[#2979FF] hover:bg-[#1f62cc] text-white'
              }
            `}
          >
            {loading ? '...' : isFollowing ? '팔로잉' : '팔로우'}
          </button>
        )}
      </Link>
    </li>
  );
}
