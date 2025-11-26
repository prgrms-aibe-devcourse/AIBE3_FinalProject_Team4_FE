'use client';

export type ScopeFilterValue = 'ALL' | 'FOLLOWING';

type ScopeFilterTabsProps = {
  value: ScopeFilterValue;
  onChange: (value: ScopeFilterValue) => void;
};

const OPTIONS: { value: ScopeFilterValue; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'FOLLOWING', label: '팔로잉' },
];

export function ScopeFilterTabs({ value, onChange }: ScopeFilterTabsProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs"
      aria-label="피드 범위 선택"
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-full px-3 py-1 font-medium transition',
              isActive
                ? 'bg-white text-[#2979FF] shadow-sm'
                : 'text-slate-500 hover:text-[#2979FF]',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
