'use client';

import { getUnreadNotificationCount } from '@/src/api/notifications';
import { useNotificationSSE } from '@/src/hooks/useNotificationSSE';
import { useAuth } from '@/src/providers/AuthProvider';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import { useCallback, useEffect } from 'react';

export default function NotificationInitializer() {
  const { loginUser } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  // 최초 접속 → unreadCount 초기화
  useEffect(() => {
    if (!loginUser) return;

    getUnreadNotificationCount().then((count) => {
      setUnreadCount(count);
    });
  }, [loginUser, setUnreadCount]);

  // SSE 메시지 핸들러
  const handleMessage = useCallback(
    (n: any) => {
      addNotification(n);
    },
    [addNotification],
  );

  useNotificationSSE({
    enabled: !!loginUser,
    onMessage: handleMessage,
  });

  return null;
}
