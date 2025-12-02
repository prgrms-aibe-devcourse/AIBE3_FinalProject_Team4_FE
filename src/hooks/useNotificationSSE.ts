'use client';

import { useEffect } from 'react';

export interface NotificationEvent {
  id: number;
  senderId: number;
  senderNickname: string;
  senderProfileImage: string | null;
  type: string;
  targetId: number;
  message: string;
  read: boolean;
  createdAt: string;
}

interface UseNotificationSSEOptions {
  enabled: boolean; // 로그인 여부 등으로 켜고 끄기
  onMessage: (n: NotificationEvent) => void;
}

export function useNotificationSSE({ enabled, onMessage }: UseNotificationSSEOptions) {
  useEffect(() => {
    if (!enabled) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_API_BASE_URL 가 설정되어 있지 않습니다.');
      return;
    }

    const url = `${baseUrl}/api/v1/notifications/stream`;

    // 쿠키(JWT) 기반 인증이면 withCredentials 필요 (polyfill 쓰는 경우도 고려)
    const es = new EventSource(url, { withCredentials: true } as any);

    es.addEventListener('connect', (event) => {
      console.log('🔗 SSE connected', event);
    });

    es.addEventListener('notification', (event) => {
      try {
        const e = event as MessageEvent;
        const data = JSON.parse(e.data) as NotificationEvent;
        onMessage(data);
      } catch (err) {
        console.error('알림 이벤트 파싱 실패:', err, event);
      }
    });

    es.onerror = (err) => {
      console.error('SSE error', err);
      es.close();
      // 필요하면 여기서 재연결 로직도 나중에 추가 가능
    };

    return () => {
      console.log('🧹 SSE close');
      es.close();
    };
  }, [enabled, onMessage]);
}
