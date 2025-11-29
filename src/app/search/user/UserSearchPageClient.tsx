'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type UserSearchResult = {
  id: number;
  nickname: string;
  profileImgUrl: string | null;
  bio: string;
  followersCount: number;
};

export default function SearchUserPage() {
  const params = useSearchParams();
  const keyword = params.get('keyword') || '';
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!keyword.trim()) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/users/search?keyword=${encodeURIComponent(keyword)}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        if (!res.ok) throw new Error('검색 실패');

        const json = await res.json();
        setUsers(json.data || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }

    load();
  }, [keyword]);

  return (
    <div className="mt-4">
      {loading ? (
        <div className="text-center text-sm text-slate-500">불러오는 중...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-sm text-slate-500">검색 결과가 없습니다.</div>
      ) : (
        <div className="space-y-1">
          {users.map((user) => (
            <a
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex items-center gap-4 p-4 rounded-md bg-white hover:bg-slate-50 transition"
            >
              {/* 프로필 이미지 */}
              <img
                src={user.profileImgUrl || '/tmpProfile.png'}
                alt="profile"
                className="w-14 h-14 rounded-full object-cover bg-slate-200"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{user.nickname}</span>
                  {user.followersCount > 0 && (
                    <span className="text-xs text-slate-500">팔로워 {user.followersCount}</span>
                  )}
                </div>

                <p className="text-sm text-slate-600 line-clamp-2">{user.bio}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
