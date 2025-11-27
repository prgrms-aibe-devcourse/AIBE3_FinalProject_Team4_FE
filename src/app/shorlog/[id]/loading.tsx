export default function ShorlogDetailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        {/* 로딩 스피너 */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#2979FF]"></div>
        <p className="text-sm font-medium text-slate-600">숏로그를 불러오는 중...</p>
      </div>
    </div>
  );
}

