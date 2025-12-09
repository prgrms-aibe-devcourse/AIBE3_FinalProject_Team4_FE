'use client';

import {
  deleteAllNotifications,
  deleteNotification,
  getRecentNotifications,
  markAllAsRead,
} from '@/src/api/notifications';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import { Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NotificationItem from '../components/notifications/NotificationItem';

export default function NotificationsPage() {
  const { notifications, setNotifications, setUnreadCount } = useNotificationStore();
  const router = useRouter();

  // 이번 주 월요일 0시
  const getStartOfThisWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  };

  const startOfThisWeek = getStartOfThisWeek();

  const thisWeek = notifications.filter((n) => new Date(n.createdAt) >= startOfThisWeek);
  const earlier = notifications.filter((n) => new Date(n.createdAt) < startOfThisWeek);

  // 초기 알림 로드 + 읽음 처리
  useEffect(() => {
    let mounted = true;

    (async () => {
      const list = await getRecentNotifications();
      if (!mounted) return;

      setNotifications(list);

      await markAllAsRead();
      if (!mounted) return;

      setUnreadCount(0);
    })();

    return () => {
      mounted = false;
    };
  }, [setNotifications, setUnreadCount]);

  const handleRemove = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  const handleRemoveAll = async () => {
    if (!confirm('모든 알림을 삭제하시겠습니까?')) return;

    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('전체 알림 삭제 실패:', error);
    }
  };

  return (
    <div className="p-5 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">알림</h1>

        {notifications.length > 0 && (
          <button
            onClick={handleRemoveAll}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
            전체 삭제
          </button>
        )}
      </div>

      {/* 이번 주 섹션 */}
      {thisWeek.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">이번 주</h2>
          <ul className="flex flex-col gap-3">
            {thisWeek.map((n) => (
              <li
                key={n.id}
                className="relative cursor-pointer"
                onClick={() => router.push(n.redirectUrl)}
              >
                <NotificationItem n={n} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(n.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-md bg-white opacity-60 hover:opacity-100 shadow-sm transition"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 이전 활동 섹션 */}
      {earlier.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">이전 활동</h2>
          <ul className="flex flex-col gap-3">
            {earlier.map((n) => (
              <li
                key={n.id}
                className="relative cursor-pointer"
                onClick={() => router.push(n.redirectUrl)}
              >
                <NotificationItem n={n} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(n.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-md bg-white opacity-60 hover:opacity-100 shadow-sm transition"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 알림 없음 */}
      {notifications.length === 0 && <p className="text-gray-500 text-sm">알림이 없습니다.</p>}
    </div>
  );
}
