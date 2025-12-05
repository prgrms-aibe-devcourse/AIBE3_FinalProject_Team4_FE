import { useState } from 'react';

type RecommendSortButtonProps = {
  active: boolean;
  onClick: () => void;
};

export function RecommendSortButton({ active, onClick }: RecommendSortButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
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

      {/* ---- Tooltip ---- */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 w-72 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xl z-20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[#2979FF] text-base">✦</span>
              <span className="font-semibold text-slate-800">개인화된 추천</span>
            </div>

            <div className="text-xs leading-relaxed text-slate-600">
              • 인기, 최신, 최근 본 게시물을 종합 분석
              <br />• 로그인 시 좋아요, 북마크, 댓글 활동 반영
            </div>
          </div>

          {/* tooltip arrow */}
          <div
            className="absolute top-full right-4 w-0 h-0 
            border-l-4 border-r-4 border-t-4 border-transparent 
            border-t-white drop-shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
