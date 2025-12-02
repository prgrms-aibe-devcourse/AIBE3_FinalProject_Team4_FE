import apiClient from '@/src/api/apiClient';

export const uploadBlogImage = async (blogId: number, formData: FormData) => {
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

export const getUnsplashImages = async (keyword: string, page: number, size: number) => {
  const response = await apiClient(`/api/v1/images/unsplash`, {
    method: 'GET',
    params: {
      keyword,
      number: page.toString(),
      size: size.toString(),
    },
  });

  return response;
};

export const getPixabayImages = async (keyword: string, page: number, size: number) => {
  const response = await apiClient(`/api/v1/images/pixabay`, {
    method: 'GET',
    params: {
      keyword,
      number: page.toString(),
      size: size.toString(),
    },
  });

  return response;
};
