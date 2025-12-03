'use client';

import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { RecommendedUser } from '@/src/types/main';
import Link from 'next/link';

export default function RecommendedUsersSection({ users }: { users: RecommendedUser[] }) {
  const { data: currentUser } = useCurrentUser();

  // 🔥 자기 자신 제외
  const filteredUsers = currentUser ? users.filter((u) => u.id !== currentUser.id) : users;

  return (
    <div className="bg-[#121826] rounded-2xl p-6 text-white shadow-lg">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">☀️ 추천 사용자</h3>

      <div className="flex flex-col gap-5">
        {filteredUsers.map((u) => (
          <RecommendedUserRow key={u.id} user={u} />
        ))}
      </div>
    </div>
  );
}

function RecommendedUserRow({ user }: { user: RecommendedUser }) {
  return (
    <Link
      href={`/profile/${user.id}`}
      className="flex items-center justify-between hover:bg-[#1a2134] transition rounded-xl p-2"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
          {user.avatarUrl && (
            <img src={user.avatarUrl} alt="avatar" className="object-cover w-full h-full" />
          )}
        </div>

        <div>
          <p className="font-medium">{user.nickname}</p>
          <p className="text-xs text-gray-400">{user.bio ?? '자기소개 없음'}</p>
        </div>
      </div>
    </Link>
  );
}
