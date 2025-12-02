import apiClient from './clientForRs';
import type { LinkedShorlogSummary, MyShorlogSummary,BlogShorlogLinkResponse } from '@/src/types/blog';

export async function fetchLinkedShorlogs(blogId: number) {
  return apiClient<LinkedShorlogSummary[]>(`/api/v1/blogs/${blogId}/linked-shorlogs`, {
    method: 'GET',
  });
}

export async function unlinkShorlog(blogId: number, shorlogId: number) {
  return apiClient(`/api/v1/blogs/${blogId}/link-shorlog/${shorlogId}`, {
    method: 'DELETE',
  });
}
export async function fetchMyRecentShorlogs(size = 7) {
  return apiClient<MyShorlogSummary[]>('/api/v1/shorlog/my/recent-shorlogs', {
    method: 'GET',
    params: { size: String(size) },
  });
}

export async function linkBlogToShorlog(blogId: number, shorlogId: number) {
  return apiClient<BlogShorlogLinkResponse>(`/api/v1/blogs/${blogId}/link-shorlog`, {
    method: 'POST',
    body: JSON.stringify({ shorlogId }),
  });
}