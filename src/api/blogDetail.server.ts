import { apiClientServer } from './apiClientServer';
import type { FollowCheckResponse } from '@/src/types/follow';

type MeResponse = {
  id: number;
  username: string;
  nickname: string;
};
export async function fetchMeServer(): Promise<MeResponse> {
  return apiClientServer<MeResponse>('/api/v1/users/me', { method: 'GET' });
}

import type { BlogDetailDto } from '@/src/types/blog';

export async function fetchBlogDetailServer(id: number): Promise<BlogDetailDto> {
  return apiClientServer<BlogDetailDto>(`/api/v1/blogs/${id}`, { method: 'GET' });
}

export async function fetchIsFollowingServer(targetUserId: number): Promise<boolean> {
  const data = await apiClientServer<FollowCheckResponse>(`/api/v1/follow/is-following/${targetUserId}`, {
    method: 'GET',
  });
  return data.isFollowing;
}
