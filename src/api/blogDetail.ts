import apiClient from '@/src/api/clientForRs';
import type { BlogDetailDto } from '@/src/types/blog';

export const fetchBlogDetail = (id: number) =>
  apiClient<BlogDetailDto>(`/api/v1/blogs/${id}`, {
    method: 'GET',
  });
  export function toggleLike(blogId: number) {
    return apiClient<void>(`/api/v1/blogs/${blogId}/like`, {
      method: 'POST',
    });
  }

  export function toggleBookmark(blogId: number) {
    return apiClient<void>(`/api/v1/blogs/${blogId}/bookmark`, {
      method: 'POST',
    });
  }

  export function deleteBlog(blogId: number) {
    return apiClient<void>(`/api/v1/blogs/${blogId}`, {
      method: 'DELETE',
    });
  }
