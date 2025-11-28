// components/profile/UserNotFound.tsx

export default function UserNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* 아이콘 */}
      <div className="text-slate-400">
        <svg width="90" height="90" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M4 22c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* 메시지 */}
      <h2 className="text-xl font-bold mt-6">이 계정을 찾지 못했습니다</h2>

      <p className="text-slate-600 mt-2">팔로우 탭에서 인기있는 인기있는 사용자를 만나보세요.</p>
    </div>
  );
}
