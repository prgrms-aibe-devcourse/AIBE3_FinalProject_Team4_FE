import apiClient from './apiClient';

export async function fetchShorlogView(id: string | number) {
  const res = await apiClient(`/api/v1/shorlog/${id}/view`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error('shorlog view 등록 실패');
  return res.json();
}

export async function fetchBlogView(id: string | number) {
  const res = await apiClient(`/api/v1/blogs/${id}/view`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error('blog view 등록 실패');
  return res.json();
}
