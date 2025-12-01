"use client";

interface ShorlogSortButtonProps {
  value: "recommend" | null;
  onChange: (next: "recommend" | null) => void;
}

export default function ShorlogSortButton({
                                            value,
                                            onChange,
                                          }: ShorlogSortButtonProps) {
  const isRecommend = value === "recommend";

  const handleClick = () => {
    // 추천순 토글: OFF(null) ↔ ON("recommend")
    onChange(isRecommend ? null : "recommend");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        isRecommend
          ? "border-[#2979FF] bg-[#2979FF] text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-500 hover:border-[#2979FF]/70 hover:text-slate-900",
      ].join(" ")}
      aria-pressed={isRecommend}
    >
      <span
        aria-hidden="true"
        className={
          isRecommend
            ? "mr-1.5 text-sm"
            : "mr-1.5 text-sm text-[#2979FF]"
        }
      >
        ✦
      </span>
      <span>추천순</span>
    </button>
  );
}
