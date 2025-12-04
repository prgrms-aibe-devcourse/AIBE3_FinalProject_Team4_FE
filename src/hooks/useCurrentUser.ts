'use client';

import { useQuery } from '@tanstack/react-query';

export interface User {
  id: number;
  username: string;
  nickname: string;
  profileImgUrl?: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/v1/auth/me`,
      {
        credentials: 'include',
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return json.data;
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
