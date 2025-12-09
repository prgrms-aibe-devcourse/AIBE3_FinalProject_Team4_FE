'use client';

import { fetchMe } from '@/src/api/user';
import { BlogCard } from '@/src/app/components/blogs/get/BlogCard';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import type { BlogScope, BlogSliceResponse, BlogSortType, BlogSummary } from '@/src/types/blog';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../common/LoadingSpinner';
import { BlogEmptyState, BlogErrorState } from './BlogStates';
import { BlogToolbar } from './BlogToolbar';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Props = {
  initialBlogs: BlogSummary[];
};

export function BlogListClient({ initialBlogs }: Props) {
  const [blogs, setBlogs] = useState<BlogSummary[]>(initialBlogs);
  const [error, setError] = useState<Error | null>(null);

  const [sortType, setSortType] = useState<BlogSortType>('LATEST');
  const [keyword, setKeyword] = useState('');
  const [scope, setScope] = useState<BlogScope>('ALL');

  const [loading, setLoading] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { open: openLoginModal } = useLoginModal();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchMe(); // 성공하면 로그인 상태
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false); // 401 등 → 비로그인
      }
    };
    checkAuth();
  }, []);
  // 로그인 안했는데 팔로잉탭 클릭시 로그인 모달
  const handleScopeChange = (next: BlogScope) => {
    if (next === 'FOLLOWING' && !isLoggedIn) {
      showGlobalToast('팔로잉 피드는 로그인 후 이용할 수 있어요.', 'warning');
      openLoginModal();
      return;
    }
    setScope(next);
  };
  async function loadBlogs() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('sort', sortType);
      params.set('scope', scope);
      if (keyword) params.set('keyword', keyword);
      const res = await fetch(`${API_BASE_URL}/api/v1/blogs?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('블로그 목록을 불러올 수 없습니다.');
      const json = (await res.json()) as BlogSliceResponse<BlogSummary>;
      setBlogs(json.content);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    loadBlogs();
  }, [sortType, keyword, scope]);

  return (
    <section className="space-y-8">
      <header className="mb-6 space-y-4 md:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">BLOG FEED</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">블로그</h1>

        <p className="max-w-2xl text-sm text-slate-500 md:text-base">
          길게 남기고 싶은 생각과 기록을 자유롭게 공유해 보세요. 연결된 짧은 글로 흐름을 느껴
          보세요.
        </p>

        <div className="pt-2">
          <BlogToolbar
            keyword={keyword}
            onKeywordChange={setKeyword}
            sortType={sortType}
            onSortChange={setSortType}
            scope={scope}
            onScopeChange={handleScopeChange}
          />
        </div>
      </header>

      {/* 블로그 리스트 */}
      <div className="space-y-4">
        {loading && (
          <div className="py-10 text-center text-sm text-slate-500">
            <LoadingSpinner label="블로그를 불러오는 중입니다" />
          </div>
        )}

        {!loading && error && <BlogErrorState onRetry={loadBlogs} />}

        {!loading && !error && blogs.length === 0 && <BlogEmptyState />}

        {!loading &&
          !error &&
          blogs.length > 0 &&
          blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
      </div>
    </section>
  );
}
