'use client';

import { getRecentNotifications, markAllAsRead } from '@/src/api/notifications';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import NotificationItem from '../components/notifications/NotificationItem';

export default function NotificationsPage() {
  const { notifications, setNotifications, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    (async () => {
      const list = await getRecentNotifications();
      setNotifications(list);

      await markAllAsRead();
      setUnreadCount(0);
    })();
  }, [setNotifications, setUnreadCount]);

  const handleRemove = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="p-5">
      <h1 className="text-lg font-semibold mb-3">알림</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">알림이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notifications.map((n: any) => (
            <li key={n.id} className="w-full">
              <div
                className="
          relative bg-white shadow-sm rounded-lg 
          px-4 py-3 
          max-w-xl   /* 카드 최대 너비 제한 */
          mx-auto    /* 가운데 정렬 */
        "
              >
                <div className="pr-6">
                  <NotificationItem n={n} />
                </div>

                <button
                  onClick={() => handleRemove(n.id)}
                  className="
            absolute top-2 right-2 
            p-1 rounded-md bg-white
            opacity-50 hover:opacity-100
            transition
          "
                >
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
