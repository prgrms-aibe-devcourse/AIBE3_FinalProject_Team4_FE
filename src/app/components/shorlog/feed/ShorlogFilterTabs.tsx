"use client";

const FILTERS = [
  { value: "all" as const, valueLabel: "전체" },
  { value: "following" as const, valueLabel: "팔로우" },
];

interface ShorlogFilterTabsProps {
  value: "all" | "following";
  onChange: (next: "all" | "following") => void;
}

export default function ShorlogFilterTabs({
                                            value,
                                            onChange,
                                          }: ShorlogFilterTabsProps) {
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
              "relative flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#2979FF] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900",
            ].join(" ")}
            aria-pressed={active}
          >
            {tab.valueLabel}
          </button>
        );
      })}
    </div>
  );
}
