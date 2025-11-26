'use client';

import { ScopeFilterTabs } from '@/src/app/components/common/ScopeFilterTabs';
import { SearchField } from '@/src/app/components/common/SearchField';
import type { BlogScope, BlogSortType } from '@/src/types/blog';
import { RecommendSortButton } from '../../common/RecommandSortButton';

type BlogToolbarProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  sortType: BlogSortType;
  onSortChange: (value: BlogSortType) => void;
  scope: BlogScope;
  onScopeChange: (value: BlogScope) => void;
};

export function BlogToolbar({
  keyword,
  onKeywordChange,
  sortType,
  onSortChange,
  scope,
  onScopeChange,
}: BlogToolbarProps) {
  const isRecommendActive = sortType === 'RECOMMEND';

  return (
    <section className="space-y-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-100 backdrop-blur-sm">
      {/* 상단: 검색 */}
      <SearchField
        id="blog-search"
        value={keyword}
        onChange={onKeywordChange}
        placeholder="키워드로 검색"
      />

      {/* 하단: 전체/팔로잉 + 추천순 + 정렬 */}
      <div className="flex items-center justify-between gap-2">
        {/* 전체 / 팔로잉 */}
        <ScopeFilterTabs
          value={scope} // BlogScope: 'ALL' | 'FOLLOWING'
          onChange={onScopeChange}
        />

        {/* 오른쪽: 추천순 + 정렬 */}
        <div className="flex items-center gap-2">
          <RecommendSortButton
            active={sortType === 'RECOMMEND'}
            onClick={() => onSortChange(sortType === 'RECOMMEND' ? 'LATEST' : 'RECOMMEND')}
          />

          <SortDropdown sortType={sortType} onSortChange={onSortChange} />
        </div>
      </div>
    </section>
  );
}

/* 정렬 드롭다운은 그대로 사용 */

type SortDropdownProps = {
  sortType: BlogSortType;
  onSortChange: (value: BlogSortType) => void;
};

const SORT_OPTIONS: { value: Exclude<BlogSortType, 'RECOMMEND'>; label: string }[] = [
  { value: 'LATEST', label: '최신순' },
  { value: 'VIEWS', label: '조회순' },
  { value: 'POPULAR', label: '인기순' },
];

function SortDropdown({ sortType, onSortChange }: SortDropdownProps) {
  const normalized = sortType === 'RECOMMEND' ? 'LATEST' : sortType;

  return (
    <div className="inline-flex items-center gap-1 text-xs text-slate-500">
      <span className="hidden sm:inline">정렬</span>
      <select
        value={normalized}
        onChange={(e) => onSortChange(e.target.value as BlogSortType)}
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/30"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
