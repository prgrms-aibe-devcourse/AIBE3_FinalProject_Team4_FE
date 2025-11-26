import { BlogListPage } from '@/src/app/components/blog/BlogListPage';
import { BlogSliceResponse, BlogSortType, BlogSummary } from '@/src/types/blog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const isCI = process.env.CI === 'true';

async function fetchBlogs(sort: BlogSortType = 'LATEST', keyword?: string)
: Promise<BlogSummary[]> {
   if (!API_BASE_URL && !isCI) {
     throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
   }
if (isCI) {
  return [];
}
  const params = new URLSearchParams();
  params.set('sort', sort);
  if (keyword) params.set('keyword', keyword);
  // size, cursor는 기본값 쓰면 일단 생략 가능

  const res = await fetch(`${API_BASE_URL}/api/v1/blogs?${params.toString()}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    console.error('fetchBlogs failed:', res.status, res.statusText);
    throw new Error('블로그 목록을 불러오지 못했습니다.');
  }

  const json = (await res.json()) as BlogSliceResponse<BlogSummary>;
  return json.content;
}

export default async function BlogsPage() {
  const initialBlogs = await fetchBlogs('LATEST');

  return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10">
          <BlogListPage />
        </div>
      </main>
  
  );
}
