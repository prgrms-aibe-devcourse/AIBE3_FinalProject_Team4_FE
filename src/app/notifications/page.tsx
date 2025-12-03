'use client';

import { getRecentNotifications, markAllAsRead } from '@/src/api/notifications';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import { useEffect } from 'react';
import NotificationItem from '../components/notifications/NotificationItem';

export default function NotificationsPage() {
  const { notifications, setNotifications, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    (async () => {
      const list = await getRecentNotifications();
      setNotifications(list);

      // 페이지 들어오면 모두 읽음 처리
      await markAllAsRead();
      setUnreadCount(0);
    })();
  }, [setNotifications, setUnreadCount]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">알림</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">알림이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n: any) => (
            <li key={n.id} className="rounded-lg bg-white shadow-sm">
              <NotificationItem n={n} /> {/* 프로필 이미지 + 닉네임 + 시간 포함 */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
