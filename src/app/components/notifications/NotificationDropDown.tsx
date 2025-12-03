'use client';

import { getRecentNotifications } from '@/src/api/notifications';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import NotificationItem from './NotificationItem';

interface Props {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: Props) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const recent = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const markAll = useNotificationStore((s) => s.markAllAsRead);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // recent 알림 로드
  useEffect(() => {
    getRecentNotifications()
      .then((list) => setNotifications(list))
      .catch(() => showGlobalToast('알림을 불러오지 못했습니다.', 'error'))
      .finally(() => setLoading(false));
  }, [setNotifications]);

  return (
    <div
      ref={dropdownRef}
      className="
        absolute top-16 left-20
        w-80 bg-white shadow-xl rounded-xl border border-gray-200
        py-2 z-[200]
      "
    >
      <div className="px-4 pb-2 border-b border-gray-100 font-medium text-sm">알림</div>
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-6">불러오는 중...</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">새로운 알림이 없습니다.</p>
        ) : (
          recent.map((n) => <NotificationItem key={n.id} n={n} />)
        )}
      </div>
      <div className="p-2 border-t border-gray-100">
        <Link href="/notifications">
          <span className="block text-center text-sm text-blue-600 hover:text-blue-700">
            전체 알림 보기
          </span>
        </Link>
      </div>
    </div>
  );
}
