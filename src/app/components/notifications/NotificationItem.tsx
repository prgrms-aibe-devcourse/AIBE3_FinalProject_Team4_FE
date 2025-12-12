'use client';

import { useRouter } from 'next/navigation';

export default function NotificationItem({ n }: { n: any }) {
  const router = useRouter();

  /** 알림 클릭 시 redirectUrl 이동 */
  const goToRedirect = () => {
    if (n.redirectUrl) {
      // 숏로그 모달로 이동하는 경우, 현재 페이지를 저장
      if (n.redirectUrl.includes('/shorlog/')) {
        sessionStorage.setItem('shorlog_modal_initial_path', window.location.pathname);
      }
      router.push(n.redirectUrl);
    }
  };

  /** 프로필 이동 */
  const goToUserProfile = () => {
    if (n.senderId) {
      router.push(`/profile/${n.senderId}`);
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-4 border border-gray-200 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition cursor-pointer"
      onClick={goToRedirect} // 전체 박스 클릭 → 글/댓글로 이동
    >
      {/* 프로필 이미지 */}
      <img
        src={n.senderProfileImage || '/tmpProfile.png'}
        alt="profile"
        onClick={(e) => {
          e.stopPropagation(); // 부모 클릭 막기 → 글 이동 X
          goToUserProfile();
        }}
        className="w-11 h-11 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
      />

      {/* 텍스트 */}
      <div className="flex flex-col flex-1">
        {/* 닉네임 클릭 → 프로필 이동 */}
        <span
          className="text-sm font-semibold cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            goToUserProfile();
          }}
        >
          {n.senderNickname}
        </span>

        <span className="text-[13px] text-gray-700 leading-snug">{n.message}</span>

        <span className="text-xs text-gray-400 mt-1">{n.relativeTime}</span>
      </div>

      {/* 읽지 않은 알림 점 표시 */}
      {!n.isRead && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2"></span>}
    </div>
  );
}
