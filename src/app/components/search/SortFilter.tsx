'use client';

import { useRouter } from 'next/navigation';

const filters = [
  { key: 'latest', label: '최신' },
  { key: 'popular', label: '인기' },
  { key: 'view', label: '조회수' },
];

export default function SortFilter({
  keyword,
  currentTab,
  currentSort,
}: {
  keyword: string;
  currentTab: string;
  currentSort: string;
}) {
  const router = useRouter();

  const changeSort = (sort: string) => {
    router.push(`/search?keyword=${keyword}&tab=${currentTab}&sort=${sort}`);
  };

  return (
    <div className="flex gap-2 mt-4">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => changeSort(f.key)}
          className={`
            px-3 py-1 text-sm rounded-full border
            ${currentSort === f.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}
          `}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
