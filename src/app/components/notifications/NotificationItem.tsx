'use client';

import { useRouter } from 'next/navigation';

export default function NotificationItem({ n }: { n: any }) {
  const router = useRouter();

  const goToUserProfile = () => {
    if (n.senderId) {
      router.push(`/profile/${n.senderId}`);
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-4 border border-gray-200 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition cursor-pointer"
      onClick={() => {
        // 알림 타입 기반 이동도 가능함. 원하면 추가해 줄게!
      }}
    >
      {/* 프로필 이미지 */}
      <img
        src={n.senderProfileImage || '/tmpProfile.png'}
        alt="profile"
        onClick={(e) => {
          e.stopPropagation(); // 부모 클릭 막기
          goToUserProfile();
        }}
        className="w-11 h-11 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
      />

      {/* 텍스트 */}
      <div className="flex flex-col flex-1">
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

      {/* 안 읽은 알림 표시 */}
      {!n.isRead && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2"></span>}
    </div>
  );
}
