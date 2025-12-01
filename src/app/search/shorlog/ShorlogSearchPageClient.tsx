'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ShortlogSearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const keyword = params.get('keyword') || '';
  const sort = params.get('sort');

  // ⭐ 기본 정렬값 지정: latest
  useEffect(() => {
    if (!sort) {
      router.replace(`/search/shorlog?keyword=${encodeURIComponent(keyword)}&sort=latest`);
    }
  }, [sort, keyword]);

  if (!sort) return null; // redirect 처리 중

  return (
    <div>
      <h1 className="text-lg font-semibold">숏로그 검색 결과</h1>
      {/* 숏로그 검색 API 호출 로직 */}
    </div>
  );
}
