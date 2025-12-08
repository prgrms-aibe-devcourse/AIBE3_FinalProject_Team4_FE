'use client';

import { useMessageThreads } from '@/src/hooks/useMessageThreads';
import { useAuth } from '@/src/providers/AuthProvider';
import { useMessagesUnreadStore } from '@/src/stores/useMessagesUnreadStore';
import { useEffect } from 'react';

export default function MessagesUnreadInitializer() {
  const { isLogin } = useAuth();
  const setUnreadCount = useMessagesUnreadStore((s) => s.setUnreadCount);

  const { data: threads = [] } = useMessageThreads(isLogin);

  useEffect(() => {
    if (!isLogin) {
      setUnreadCount(0);
      return;
    }
    const total = threads.reduce((acc, t) => acc + (t.unreadCount ?? 0), 0);
    setUnreadCount(total);
  }, [isLogin, threads, setUnreadCount]);

  return null;
}
