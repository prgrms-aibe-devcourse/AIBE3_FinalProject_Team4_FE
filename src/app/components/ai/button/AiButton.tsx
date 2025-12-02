import LoadingSpinner from '../../common/LoadingSpinner';

interface AIButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function AIButton({ onClick, isLoading }: AIButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
    >
      {isLoading && <LoadingSpinner size="sm" inline />}
      <span>{isLoading ? 'AI 추천 중...' : 'AI 해시태그 추천'}</span>
    </button>
  );
}
