'use client';
type BlogErrorStateProps = {
  onRetry: () => void;
};

export function BlogErrorState({ onRetry }: BlogErrorStateProps) {
  return (
    <>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-100 bg-rose-50/40 px-4 py-10 text-center">
        <p className="text-sm font-medium text-rose-700">블로그를 불러오는 중 문제가 발생했어요.</p>
        <p className="mt-1 text-xs text-rose-500">네트워크 상태를 확인하시고 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
        >
          다시 시도
        </button>
      </div>
    </>
  );
}

export function BlogEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
        <span className="text-lg">✏️</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-800">아직 볼 수 있는 블로그가 없어요.</p>
      <p className="mt-1 text-xs text-slate-500">
        첫 글을 작성해 보거나, 더 많은 작가를 팔로우해 보세요.
      </p>
      <a
        href="/blogs/new"
        className="mt-4 inline-flex items-center rounded-full bg-[#2979FF] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50"
      >
        새 블로그 쓰기
      </a>
    </div>
  );
}
