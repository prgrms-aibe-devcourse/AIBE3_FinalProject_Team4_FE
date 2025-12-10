import { BlogListClient } from '@/src/app/components/blogs/get/BlogListPage';
import { BlogSliceResponse, BlogSortType, BlogSummary } from '@/src/types/blog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchBlogs(sort: BlogSortType = 'LATEST'): Promise<BlogSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/blogs?sort=${sort}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('블로그 목록 조회 실패');

  const json: BlogSliceResponse<BlogSummary> = await res.json();
  return json.content;
}

export default async function BlogsPage() {
  const initialBlogs = await fetchBlogs('LATEST');

  return <BlogListClient initialBlogs={initialBlogs} />;
}
