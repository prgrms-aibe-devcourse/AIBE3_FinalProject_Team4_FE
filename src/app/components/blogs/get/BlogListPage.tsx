'use client';

import { BlogCard } from '@/src/app/components/blogs/get/BlogCard';
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
        params.set('scope', scope);
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
      <header className="mb-6 space-y-4 md:mb-8">
        {/* 상단 라벨 */}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">BLOG FEED</p>

        {/* 메인 타이틀 */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">블로그</h1>

        {/* 설명 문구 */}
        <p className="max-w-2xl text-sm text-slate-500 md:text-base">
          길게 남기고 싶은 생각과 기록을 자유롭게 공유해 보세요. 연결된 짧은 글로 흐름을 느껴 보세요.
        </p>

        {/* 블로그 툴바 */}
        <div className="pt-2">
          <BlogToolbar
            keyword={keyword}
            onKeywordChange={setKeyword}
            sortType={sortType}
            onSortChange={setSortType}
            scope={scope}
            onScopeChange={setScope}
          />
        </div>
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
