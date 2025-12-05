import apiClient from '@/src/api/clientForRs';
import type {
  BlogDraftDto,
  BlogMediaUploadResponse,
  BlogWriteDto,
  BlogWriteReqBody,
} from '@/src/types/blog';

export function createDraft(body: BlogWriteReqBody) {
  return apiClient<BlogWriteDto>('/api/v1/blogs/drafts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateBlog(blogId: number, body: BlogWriteReqBody) {
  return apiClient<BlogWriteDto>(`/api/v1/blogs/${blogId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
export const fetchDrafts = () =>
  apiClient<BlogDraftDto[]>('/api/v1/blogs/drafts', {
    method: 'GET',
  });

export function deleteBlog(blogId: number) {
  return apiClient<void>(`/api/v1/blogs/${blogId}`, {
    method: 'DELETE',
  });
}
export const uploadThumbnail = (blogId: number, file: File) => {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('type', 'THUMBNAIL');

  return apiClient<BlogMediaUploadResponse>(`/api/v1/blogs/${blogId}/media`, {
    method: 'POST',
    body: formData,
  });
};
