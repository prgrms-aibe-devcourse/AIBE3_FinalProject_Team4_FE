'use client';

import { BlogCard } from '@/src/app/components/blog/BlogCard';
import type { BlogScope, BlogSliceResponse, BlogSortType, BlogSummary } from '@/src/types/blog';
import { useEffect, useState } from 'react';
import { BlogToolbar } from './BlogToolbar';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [sortType, setSortType] = useState<BlogSortType>('LATEST');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<BlogScope>('ALL');

  useEffect(() => {
    async function loadBlogs() {
      try {
        const params = new URLSearchParams();
        params.set('sort', sortType);
        if (keyword) params.set('keyword', keyword);

        const res = await fetch(`${API_BASE_URL}/api/v1/blogs?${params.toString()}`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Fetch failed');

        const json = (await res.json()) as BlogSliceResponse<BlogSummary>;
        setBlogs(json.content);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadBlogs();
  }, [sortType, keyword]);

  if (loading) return <p>로딩 중...</p>;

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-2xl font-bold">블로그</h1>
        <p className="mt-1 text-sm text-slate-500">다양한 이야기와 생각들을 만나보세요.</p>
        <BlogToolbar
          keyword={keyword}
          onKeywordChange={setKeyword}
          sortType={sortType}
          onSortChange={setSortType}
          scope={scope}
          onScopeChange={setScope}
        />
      </header>

      {/* 블로그 리스트 */}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
