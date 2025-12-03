import apiClient from './clientForRs';
import type {
  LinkedShorlogSummary,
  MyShorlogSummary,
  BlogShorlogLinkResponse,
  MyBlogSummary,
  ShorlogBlogLinkResponse,
  LinkedBlogSummary
} from '@/src/types/blog';

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

// 숏로그 → 블로그 연결 관련 함수들
export async function fetchMyRecentBlogs(size = 7) {
  return apiClient<MyBlogSummary[]>('/api/v1/blogs/my/recent-blogs', {
    method: 'GET',
    params: { size: String(size) },
  });
}

export async function linkShorlogToBlog(shorlogId: number, blogId: number) {
  return apiClient<ShorlogBlogLinkResponse>(`/api/v1/shorlog/${shorlogId}/link-blog`, {
    method: 'POST',
    body: JSON.stringify({ blogId }),
  });
}

export async function unlinkShorlogFromBlog(shorlogId: number, blogId: number) {
  return apiClient<void>(`/api/v1/shorlog/${shorlogId}/link-blog/${blogId}`, {
    method: 'DELETE',
  });
}

export async function fetchLinkedBlogs(shorlogId: number) {
  return apiClient<LinkedBlogSummary[]>(`/api/v1/shorlog/${shorlogId}/linked-blogs`, {
    method: 'GET',
  });
}

// 숏로그에 연결된 블로그 ID 목록 조회 (공개)
export async function fetchLinkedBlogIds(shorlogId: number) {
  return apiClient<number[]>(`/api/v1/shorlog/${shorlogId}/linked-blogs`, {
    method: 'GET',
  });
}



