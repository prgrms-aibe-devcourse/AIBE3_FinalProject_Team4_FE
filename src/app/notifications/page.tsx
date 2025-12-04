'use client';

import {
  deleteAllNotifications,
  deleteNotification,
  getRecentNotifications,
  markAllAsRead,
} from '@/src/api/notifications';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import { Trash2, X } from 'lucide-react';
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

  const handleRemove = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id)); // 수정: 함수형 업데이트
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  const handleRemoveAll = async () => {
    if (!confirm('모든 알림을 삭제하시겠습니까?')) return;

    try {
      await deleteAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('전체 알림 삭제 실패:', error);
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold">알림</h1>
        {notifications.length > 0 && (
          <button
            onClick={handleRemoveAll}
            className="
              flex items-center gap-1.5 
              text-sm text-gray-600 hover:text-red-600
              transition-colors
            "
          >
            <Trash2 size={16} />
            전체 삭제
          </button>
        )}
      </div>

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
          max-w-xl
          mx-auto
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
                  aria-label="알림 삭제"
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
