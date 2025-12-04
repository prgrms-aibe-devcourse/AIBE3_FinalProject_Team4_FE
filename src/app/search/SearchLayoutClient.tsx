'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

// 탭 목록
const tabs = [
  { key: 'shorlog', label: '숏로그' },
  { key: 'blog', label: '블로그' },
  { key: 'user', label: '사용자' },
];

// 탭별 정렬 옵션 분기
const sortMap: Record<string, { key: string; label: string }[] | null> = {
  shorlog: [
    { key: 'latest', label: '최신' },
    { key: 'popular', label: '인기' },
    { key: 'view', label: '조회수' },
  ],
  blog: [
    { key: 'latest', label: '최신' },
    { key: 'popular', label: '인기' },
    { key: 'view', label: '조회수' },
  ],
  user: null, // 사용자 탭은 정렬 없음
};
export default function SearchLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const keyword = params.get('keyword') || '';
  const activeTab = pathname.split('/').pop() || 'shorlog';

  const availableSorts = sortMap[activeTab];
  const currentSort = params.get('sort') || (availableSorts ? availableSorts[0].key : '');

  const moveTab = (tab: string) => {
    router.push(`/search/${tab}?keyword=${encodeURIComponent(keyword)}&sort=${currentSort}`);
  };

  const changeSort = (sort: string) => {
    router.push(`/search/${activeTab}?keyword=${encodeURIComponent(keyword)}&sort=${sort}`);
  };

  return (
    <main className="ml-20 px-4 sm:px-8 py-4 sm:py-6">
      {/* 사이드바 고려한 메인 컨테이너 */}
      <div className="mx-auto ">
        <div className="mb-8">
          {/* 상단 큰 제목 */}
          <header className="text-xl sm:text-2xl font-bold text-slate-900">검색 결과</header>
          {keyword && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2">
              <span className="text-base sm:text-lg text-slate-900">“{keyword}”</span>
              <span className="text-xs text-slate-500">에 대한 검색 결과</span>
              {/* 필요시 추후 개수 표시 넣을 자리 */}
              {/* {totalCount != null && (
              <span className="text-[11px] text-slate-500">약 {totalCount}개</span>
            )} */}
            </div>
          )}
          <div className="mb-4"></div>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
            숏로그 · 블로그 · 사용자 결과를 스크롤하며 빠르게 살펴보세요.
          </p>
        </div>

        {/* === 탭 + 정렬 영역 === */}
        <div className="flex items-end justify-between border-b border-slate-200">
          {/* 왼쪽 탭 */}
          <div className="flex gap-0 text-sm sm:text-base">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => moveTab(t.key)}
                className={`
                px-4 sm:px-6 pb-2 border-b-2 transition-colors
                ${
                  activeTab === t.key
                    ? 'border-slate-900 font-semibold text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }
              `}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 오른쪽 정렬 (user 탭 제외) */}
          {availableSorts && (
            <div className="inline-flex items-center rounded-md bg-slate-100 p-0.5 text-[11px] sm:text-[13px]">
              {availableSorts.map((s) => (
                <button
                  key={s.key}
                  onClick={() => changeSort(s.key)}
                  className={`
                    px-2.5 sm:px-3 py-1.5 rounded-md transition
                    ${
                      currentSort === s.key
                        ? 'bg-white shadow text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }
                  `}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* === 탭별 컨텐츠 === */}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
