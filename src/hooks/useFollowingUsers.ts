import { fetchFollowingUsers } from '@/src/api/following';
import { useQuery } from '@tanstack/react-query';

export function useFollowingUsers(meId: number, q: string, enabled: boolean) {
  return useQuery({
    queryKey: ['following-users', meId, q],
    queryFn: () => fetchFollowingUsers({ meId, q: q.trim() || undefined }),
    enabled: enabled && meId > 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}
