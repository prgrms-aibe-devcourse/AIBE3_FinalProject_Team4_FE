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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 pt-10">
        <BlogListClient initialBlogs={initialBlogs} />
      </div>
    </main>
  );
}
