'use client';

import { createStompClient } from '@/src/lib/wsClient';
import { useAuth } from '@/src/providers/AuthProvider';
import { useMessagesUnreadStore } from '@/src/stores/useMessagesUnreadStore';
import type { StompSubscription } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import * as React from 'react';

type MessagePushDto = {
  id: number;
  messageThreadId: number;
  senderId: number;
  senderNickname: string;
  profileImgUrl: string | null;
  content: string;
  createdAt: string;
};

export default function MessagesRealtimeInitializer() {
  const { isLogin, loginUser } = useAuth();
  const myUserId = loginUser?.id ?? -1;

  const queryClient = useQueryClient();
  const setUnread = useMessagesUnreadStore((s) => s.setUnreadCount);

  const clientRef = React.useRef<ReturnType<typeof createStompClient> | null>(null);
  const inboxSubRef = React.useRef<StompSubscription | null>(null);

  const pathname = usePathname();
  const pathnameRef = React.useRef(pathname);
  const incUnread = useMessagesUnreadStore((s) => s.incUnread);

  // ✅ 전역에서 messageThreads를 최신으로 당겨와 unread 합산
  const refreshUnreadFromThreads = React.useCallback(async () => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['messageThreads'],
      });
      const threads = (data as any[]) ?? [];
      const total = threads.reduce((acc, t) => acc + (t.unreadCount ?? 0), 0);
      setUnread(total);
    } catch {
      // 실패하면 조용히 무시 (다음 이벤트/포커스 때 다시 맞춰짐)
    }
  }, [queryClient, setUnread]);

  React.useEffect(() => {
    if (!isLogin || myUserId <= 0) {
      setUnread(0);
      return;
    }
    // 로그인 직후 한번 맞춰줌
    refreshUnreadFromThreads();
  }, [isLogin, myUserId, refreshUnreadFromThreads, setUnread]);

  React.useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  React.useEffect(() => {
    if (!isLogin || myUserId <= 0) return;
    if (clientRef.current) return;

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      inboxSubRef.current?.unsubscribe?.();

      inboxSubRef.current = client.subscribe(`/sub/users.${myUserId}`, (msg) => {
        const nowPath = pathnameRef.current; // ✅ 항상 최신 경로
        if (!nowPath.startsWith('/messages')) {
          incUnread(1);
        }
      });
      client.onWebSocketError = (e) => console.log('[MR-init] ws error', e);
      client.onStompError = (frame) => {
        console.error('[global stomp error]', frame.headers['message'], frame.body);
      };
    };

    client.activate();

    return () => {
      try {
        inboxSubRef.current?.unsubscribe();
      } catch {}
      inboxSubRef.current = null;
      try {
        client.deactivate();
      } catch {}
      clientRef.current = null;
    };
  }, [isLogin, myUserId, queryClient, refreshUnreadFromThreads]);

  return null;
}
