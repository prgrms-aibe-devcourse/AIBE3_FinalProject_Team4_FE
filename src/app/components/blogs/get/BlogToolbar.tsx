'use client';

import { ScopeFilterTabs } from '@/src/app/components/blogs/get/ScopeFilterTabs';
import { SearchField } from '@/src/app/components/common/SearchField';
import type { BlogScope, BlogSortType } from '@/src/types/blog';
import { RecommendSortButton } from './RecommandSortButton';

const BLOG_SCOPE_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'FOLLOWING', label: '팔로잉' },
] as const;

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
    <section className="space-y-3 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <div>
        <SearchField
          id="blog-search"
          value={keyword}
          onChange={onKeywordChange}
          placeholder="키워드로 블로그 검색"
        />
      </div>
      {/* 상단: 범위 + 추천순 + 정렬 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 전체 / 팔로잉 */}
        <div className="shrink-0">
          <ScopeFilterTabs value={scope} onChange={onScopeChange} />
        </div>

        {/* 오른쪽: 추천순 + 정렬 */}
        <div className="flex items-center gap-2">
          <RecommendSortButton
            active={isRecommendActive}
            onClick={() => onSortChange(isRecommendActive ? 'LATEST' : 'RECOMMEND')}
          />
          <SortDropdown sortType={sortType} onSortChange={onSortChange} />
        </div>
      </div>
    </section>
  );
}

/* 정렬 드롭다운 */

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
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/30"
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
