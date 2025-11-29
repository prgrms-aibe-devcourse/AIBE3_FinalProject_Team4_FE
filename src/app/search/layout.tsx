'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  ],
  user: null, // 사용자 탭은 정렬 없음
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const keyword = params.get('keyword') || '';
  const activeTab = pathname.split('/').pop() || 'shorlog';

  // 현재 탭 기준 정렬 옵션 목록
  const availableSorts = sortMap[activeTab];

  // sort param은 없을 수도 있으므로 기본값 처리
  const currentSort = params.get('sort') || (availableSorts ? availableSorts[0].key : '');

  // 탭 이동
  const moveTab = (tab: string) => {
    router.push(`/search/${tab}?keyword=${encodeURIComponent(keyword)}&sort=${currentSort}`);
  };

  // 정렬 변경
  const changeSort = (sort: string) => {
    router.push(`/search/${activeTab}?keyword=${encodeURIComponent(keyword)}&sort=${sort}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
      {/* === 탭 + 정렬 === */}
      <div className="flex items-end justify-between border-b border-slate-200">
        {/* 왼쪽 탭 */}
        <div className="flex gap-0 text-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => moveTab(t.key)}
              className={`
                px-8 pb-2 border-b-2
                ${
                  activeTab === t.key
                    ? 'border-slate-900 font-semibold'
                    : 'border-transparent text-slate-500'
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 오른쪽 정렬 — user 탭은 없음 */}
        {availableSorts && (
          <div className="inline-flex items-center rounded-md bg-slate-100 p-0.5 text-[13px]">
            {availableSorts.map((s) => (
              <button
                key={s.key}
                onClick={() => changeSort(s.key)}
                className={`
                  px-3 py-1.5 rounded-md
                  ${currentSort === s.key ? 'bg-white shadow text-slate-900' : 'text-slate-500'}
                `}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* === 컨텐츠 === */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
