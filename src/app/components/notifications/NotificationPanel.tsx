'use client';

import { getRecentNotifications } from '@/src/api/notifications';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NotificationItem from './NotificationItem';

interface Props {
  open: boolean;
  onClose: () => void;
  sidebarWidth: number;
}

export default function NotificationPanel({ open, onClose, sidebarWidth }: Props) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const recent = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  // 알림 로딩
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    getRecentNotifications()
      .then((list) => setNotifications(list))
      .catch(() => showGlobalToast('알림을 불러오지 못했습니다.', 'error'))
      .finally(() => setLoading(false));
  }, [open, setNotifications]);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div
      className={`
        fixed top-0 
        h-screen w-[400px]
        bg-white text-gray-900
        border-r border-gray-200
        overflow-hidden
        transition-transform duration-300 ease-out
        shadow-xl
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        left: sidebarWidth,
        zIndex: 55,
      }}
    >
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="h-full overflow-y-auto px-6 pt-8 pb-6 custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">알림</h2>
          <button
            onClick={() => {
              router.push('/notifications');
              onClose();
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            모두 보기
          </button>
        </div>

        {/* 이번 주 */}
        <section className="mb-10">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">이번 주</h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.slice(0, 5).length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">새로운 알림이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.slice(0, 5).map((n) => (
                <NotificationItem key={n.id} n={n} />
              ))}
            </div>
          )}
        </section>

        {/* 이전 활동 */}
        {!loading && recent.slice(5).length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 mb-4">이전 활동</h3>
            <div className="space-y-3">
              {recent.slice(5).map((n) => (
                <NotificationItem key={n.id} n={n} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 커스텀 스크롤바 스타일 */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}
