import { Sparkle } from 'lucide-react';

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
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'bg-[#2979FF] text-white shadow-sm'
          : 'bg-[#2979FF]/10 text-[#2979FF] hover:bg-[#2979FF]/20',
      ].join(' ')}
    >
      <Sparkle size={14} />
      추천순
    </button>
  );
}
