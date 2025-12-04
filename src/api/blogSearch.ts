import apiClient from './clientForRs';
import type { BlogSliceResponse, BlogSummary } from '@/src/types/blog';

export type BlogSearchSort = 'LATEST' | 'VIEWS' | 'POPULAR';

export type BlogSearchParams = {
  keyword: string;
  sort: BlogSearchSort;
  size?: number;
  cursor?: string | null;
};

export async function searchBlogs({
  keyword,
  sort,
  size = 20,
  cursor,
}: BlogSearchParams): Promise<BlogSliceResponse<BlogSummary>> {
  const params: Record<string, string> = {
    sort,
    size: String(size),
  };

  if (keyword) params.keyword = keyword;
  if (cursor) params.cursor = cursor;

  return apiClient<BlogSliceResponse<BlogSummary>>('/api/v1/blogs/search', {
    method: 'GET',
    params,
  });
}
