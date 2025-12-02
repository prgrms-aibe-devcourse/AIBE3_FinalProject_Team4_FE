import apiClient from './apiClient';

export type ShorlogSearchSort = 'latest' | 'popular' | 'view';

export interface ShorlogSearchItem {
  id: number;
  content: string;
  thumbnailUrl: string | null;
  profileImgUrl: string;
  nickname: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
}

export interface ShorlogSearchResponse {
  content: ShorlogSearchItem[];
  pageable: {
    pageNumber: number;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
}

export interface RsData<T> {
  resultCode: string;
  msg: string;
  data: T;
}

export const searchShorlogs = async (
  query: string,
  sort: ShorlogSearchSort = 'latest',
  page: number = 0
): Promise<ShorlogSearchResponse> => {
  const response = await apiClient('/api/v1/shorlog/search', {
    params: {
      q: query,
      sort: sort,
      page: page.toString(),
    },
  });

  if (!response.ok) {
    throw new Error(`검색 실패: ${response.status}`);
  }

  const rsData: RsData<ShorlogSearchResponse> = await response.json();
  return rsData.data;
};

