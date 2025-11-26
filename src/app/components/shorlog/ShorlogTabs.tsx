import type { ShorlogTab } from './ShorlogFeedPageClient';

type TabDef = {
  id: ShorlogTab;
  label: string;
};

const TABS: TabDef[] = [
  { id: 'ai', label: 'AI 추천' },
  { id: 'following', label: '팔로잉' },
];

interface ShorlogTabsProps {
  activeTab: ShorlogTab;
  onChange: (tab: ShorlogTab) => void;
}

export default function ShorlogTabs({ activeTab, onChange }: ShorlogTabsProps) {
  return (
    <div className="flex items-center justify-end">
      <div
        className="
          inline-flex items-center gap-1
          rounded-full bg-white/80 p-1
          shadow-sm ring-1 ring-slate-200
        "
        role="tablist"
        aria-label="숏로그 피드 탭"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          const baseClass = `
            relative inline-flex items-center justify-center
            rounded-full px-5 py-1.5
            text-[13px] font-semibold whitespace-nowrap
            transition
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-sky-500
            focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50
          `;

          const stateClass = isActive
            ? 'bg-sky-500 text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-900';

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${baseClass} ${stateClass}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
