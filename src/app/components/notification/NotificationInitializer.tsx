'use client';

import { useNotificationSSE } from '@/src/hooks/useNotificationSSE';
import { useAuth } from '@/src/providers/AuthProvider';
import { useNotificationStore } from '@/src/stores/userNotificationsStore';
import { useCallback } from 'react';

export default function NotificationInitializer() {
  const { loginUser } = useAuth(); // 로그인 정보
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleMessage = useCallback(
    (n: any) => {
      // 여기서 타입 맞게 가공 가능
      addNotification(n);
    },
    [addNotification],
  );

  useNotificationSSE({
    enabled: !!loginUser, // 로그인 된 상태에서만 SSE 연결
    onMessage: handleMessage,
  });

  return null; // 화면에 아무것도 렌더링 안 함, 그냥 효과만 수행
}
