'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function BlogSearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const keyword = params.get('keyword') || '';
  const sort = params.get('sort');

  // ⭐ 기본 정렬값: popular
  useEffect(() => {
    if (!sort) {
      router.replace(`/search/blog?keyword=${encodeURIComponent(keyword)}&sort=popular`);
    }
  }, [sort, keyword]);

  if (!sort) return null;

  return (
    <div>
      <h1 className="text-lg font-semibold">블로그 검색 결과</h1>
      {/* 블로그 검색 API 호출 로직 */}
    </div>
  );
}
