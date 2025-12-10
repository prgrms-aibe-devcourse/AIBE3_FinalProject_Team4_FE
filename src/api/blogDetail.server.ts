import { apiClientServer } from './apiClientServer';
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
  return apiClientServer<boolean>(`/api/v1/follow/${targetUserId}/is-following`, {
    method: 'GET',
  });
}
