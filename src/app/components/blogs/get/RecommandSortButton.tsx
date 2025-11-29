type RecommendSortButtonProps = {
  active: boolean;
  onClick: () => void;
};

export function RecommendSortButton({ active, onClick }: RecommendSortButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-[#2979FF] bg-[#2979FF] text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-500 hover:border-[#2979FF]/70 hover:text-slate-900',
      ].join(' ')}
    >
      <span aria-hidden className={active ? 'text-sm' : 'text-sm text-[#2979FF]'}>
        ✦
      </span>
      <span>추천순</span>
    </button>
  );
}
