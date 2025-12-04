// app/search/components/SearchTabs.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const tabs = [
  { key: 'shortlog', label: '숏로그' },
  { key: 'blog', label: '블로그' },
  { key: 'user', label: '사용자' },
];

export default function SearchTabs({ keyword, activeTab }: { keyword: string; activeTab: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const sort = params.get('sort') || 'latest';

  const changeTab = (tab: string) => {
    router.push(`/search?keyword=${keyword}&tab=${tab}&sort=${sort}`);
  };

  return (
    <div className="flex items-center gap-6 border-b border-gray-100 pb-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`
            px-2 pb-1 text-lg 
            ${activeTab === t.key ? ' font-semibold' : 'text-gray-500'}
          `}
          onClick={() => changeTab(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
