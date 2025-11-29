'use client';

import type { BlogScope } from '@/src/types/blog';

const FILTERS: { value: BlogScope; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'FOLLOWING', label: '팔로잉' },
];

interface ScopeFilterTabsProps {
  value: BlogScope;
  onChange: (next: BlogScope) => void;
}

export function ScopeFilterTabs({ value, onChange }: ScopeFilterTabsProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
      {FILTERS.map((tab) => {
        const active = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={[
              'relative flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              active ? 'bg-[#2979FF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900',
            ].join(' ')}
            aria-pressed={active}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
