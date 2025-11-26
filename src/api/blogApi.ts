import apiClient from './apiClient';

export const uploadBlogImage = async (blogId: string, formData: FormData) => {
  const response = await apiClient(`/api/v1/blogs/${blogId}/media`, {
    method: 'POST',
    body: formData,
  });

  return response;
};

export const getBlogById = async (blogId: string) => {
  const response = await apiClient(`/api/v1/blogs/${blogId}`, {
    method: 'GET',
  });

  return response;
};
