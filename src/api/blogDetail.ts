import apiClient from '@/src/api/clientForRs';
import type {
  BlogBookmarkResponse,
  BlogDetailDto,
  BlogLikeResponse,
  ViewResponse,
} from '@/src/types/blog';

export const fetchBlogDetail = (id: number) =>
  apiClient<BlogDetailDto>(`/api/v1/blogs/${id}`, {
    method: 'GET',
  });
// 조회수
export function increaseBlogView(id: number) {
  return apiClient<ViewResponse>(`/api/v1/blogs/${id}/view`, {
    method: 'PUT',
  });
}

export function likeBlog(id: number) {
  return apiClient<BlogLikeResponse>(`/api/v1/blogs/${id}/like`, {
    method: 'PUT',
  });
}

export function unlikeBlog(id: number) {
  return apiClient<BlogLikeResponse>(`/api/v1/blogs/${id}/like`, {
    method: 'DELETE',
  });
}

export function addBookmark(id: number) {
  return apiClient<BlogBookmarkResponse>(`/api/v1/blogs/${id}/bookmark`, {
    method: 'PUT',
  });
}

export function removeBookmark(id: number) {
  return apiClient<BlogBookmarkResponse>(`/api/v1/blogs/${id}/bookmark`, {
    method: 'DELETE',
  });
}

export function deleteBlog(blogId: number) {
  return apiClient<void>(`/api/v1/blogs/${blogId}`, {
    method: 'DELETE',
  });
}
