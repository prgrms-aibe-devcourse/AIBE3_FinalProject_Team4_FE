'use client';

import { isFollowing } from '@/src/api/followApi';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { RecommendedUser } from '@/src/types/main';
import { useEffect, useState } from 'react';
import RecommendedUsersSection from './RecommendedUsersSection';

export default function RecommendedUsersClientSection({
  initialUsers,
}: {
  initialUsers: RecommendedUser[];
}) {
  const { data: currentUser } = useCurrentUser();
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    // ❗ 1) currentUser 또는 currentUser.id 없으면 바로 종료
    if (!currentUser?.id) return;

    // ❗ 2) currentUser.id를 안전한 원시 타입으로 분리
    const currentUserId = currentUser.id;

    async function loadFollowStatuses() {
      const updated = await Promise.all(
        initialUsers.map(async (u) => {
          // ❗ 3) currentUserId 사용 → 절대 null 아님
          if (u.id === currentUserId) return { ...u, isFollowing: false };

          try {
            const following = await isFollowing(u.id);
            return { ...u, isFollowing: following };
          } catch {
            return u;
          }
        }),
      );
      setUsers(updated);
    }

    loadFollowStatuses();
  }, [initialUsers, currentUser]);

  return <RecommendedUsersSection users={users} />;
}
