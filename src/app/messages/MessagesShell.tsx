'use client';

import apiClient from '@/src/api/clientForRs';
import { messagesApi } from '@/src/api/messagesApi';
import ChatPanel from '@/src/app/components/messages/ChatPanel';
import NewThreadModal, { type FollowingUser } from '@/src/app/components/messages/NewThreadModal';
import ThreadList from '@/src/app/components/messages/ThreadList';
import { useFollowingUsers } from '@/src/hooks/useFollowingUsers';
import { useMessageThread } from '@/src/hooks/useMessageThread';
import { useMessageThreads } from '@/src/hooks/useMessageThreads';
import { createStompClient } from '@/src/lib/wsClient';
import { useAuth } from '@/src/providers/AuthProvider';
import type { ChatMessage, MessageThread } from '@/src/types/messages';
import { mapDetailMessages } from '@/src/utils/messagesMapper';
import type { StompSubscription } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
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

type ReadMessageThreadRequestDto = {
  lastMessageId?: number | null;
};

type ReadMessageThreadResponseDto = {
  messageThreadId: number;
  lastReadMessageId: number;
};

function useDebouncedValue<T>(value: T, delay = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return v;
}

function safeJsonParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function pushToChatMessage(dto: MessagePushDto, myId: number): ChatMessage {
  return {
    id: String(dto.id),
    sender: dto.senderId === myId ? 'me' : 'them',
    text: dto.content,
    at: dto.createdAt,
  };
}

function compareLastAtDesc(a: MessageThread, b: MessageThread) {
  const ta = a.lastAt ? Date.parse(a.lastAt) : 0;
  const tb = b.lastAt ? Date.parse(b.lastAt) : 0;
  return tb - ta;
}

async function markThreadRead(threadId: string, meId: number, lastMessageId?: number | null) {
  if (!threadId || meId <= 0) return;

  await apiClient<ReadMessageThreadResponseDto>(`/message-threads/${threadId}/read`, {
    method: 'POST',
    params: { meId: String(meId) },
    body: JSON.stringify({ lastMessageId } satisfies ReadMessageThreadRequestDto),
  });
}

export default function MessagesShell() {
  // ---------------------------------------------------------------------------
  // 1) Auth / Router
  // ---------------------------------------------------------------------------
  const { isLogin, loginUser } = useAuth();
  const myUserId = loginUser?.id ?? -1;
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const threadIdFromQuery = searchParams.get('threadId');

  // ---------------------------------------------------------------------------
  // 2) UI state
  // ---------------------------------------------------------------------------
  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState<'all' | 'unread'>('all');
  const [activeId, setActiveId] = React.useState<string>('');

  // new thread modal
  const [newOpen, setNewOpen] = React.useState(false);
  const [newQ, setNewQ] = React.useState('');
  const debouncedQ = useDebouncedValue(newQ, 250);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // ---------------------------------------------------------------------------
  // 3) Data queries (서버가 진실)
  // ---------------------------------------------------------------------------
  const {
    data: threadsFromServer = [],
    isLoading: listLoading,
    isError: listError,
    refetch: refetchThreads,
  } = useMessageThreads();

  const effectiveActiveId = threadIdFromQuery ? String(threadIdFromQuery) : activeId;
  const activeThreadIdNum = effectiveActiveId ? Number(effectiveActiveId) : undefined;
  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
  } = useMessageThread(activeThreadIdNum);

  const {
    data: followingDtos = [],
    isLoading: followingLoading,
    isError: followingIsError,
  } = useFollowingUsers(myUserId, debouncedQ, newOpen);

  const followingUsers: FollowingUser[] = React.useMemo(
    () =>
      followingDtos.map((u) => ({
        id: u.id,
        name: u.nickname,
        handle: u.handle ?? undefined,
        avatarUrl: u.profileImgUrl ?? undefined,
      })),
    [followingDtos],
  );

  // ---------------------------------------------------------------------------
  // 4) Real-time client state
  //    - liveMessages: "현재 열려있는 방"에서만 즉시 append (UI 반응용)
  //    - unreadCount는 절대 로컬로 +1 하지 않음 (서버 list만 믿기)
  // ---------------------------------------------------------------------------
  const [liveMessages, setLiveMessages] = React.useState<Record<string, ChatMessage[]>>({});

  // list invalidate를 너무 자주 안 때리려고 throttle
  const dirtyRef = React.useRef<Set<string>>(new Set());
  const flushTimerRef = React.useRef<number | null>(null);

  const scheduleThreadsSync = React.useCallback(() => {
    if (flushTimerRef.current) return;
    flushTimerRef.current = window.setTimeout(() => {
      flushTimerRef.current = null;
      dirtyRef.current.clear();
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
    }, 150);
  }, [queryClient]);

  // markRead throttle
  const lastReadSentRef = React.useRef<Record<string, number>>({});
  const readTimerRef = React.useRef<number | null>(null);
  const pendingReadRef = React.useRef<{ threadId: string; lastMessageId: number } | null>(null);

  const scheduleMarkRead = React.useCallback(
    (threadId: string, lastMessageId: number) => {
      if (!threadId || myUserId <= 0) return;

      const lastSent = lastReadSentRef.current[threadId] ?? 0;
      if (lastMessageId <= lastSent) return;

      pendingReadRef.current = { threadId, lastMessageId };
      if (readTimerRef.current) return;

      readTimerRef.current = window.setTimeout(async () => {
        readTimerRef.current = null;
        const pending = pendingReadRef.current;
        pendingReadRef.current = null;
        if (!pending) return;

        try {
          await markThreadRead(pending.threadId, myUserId, pending.lastMessageId);
          lastReadSentRef.current[pending.threadId] = pending.lastMessageId;

          // 읽음 처리 후 리스트(unread)도 서버 기준으로 바로 맞추기
          queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
        } catch (e) {
          console.warn('[markRead failed]', e);
        }
      }, 250);
    },
    [myUserId, queryClient],
  );

  // ---------------------------------------------------------------------------
  // 5) Derived data (정렬/필터만)
  // ---------------------------------------------------------------------------
  const threads: MessageThread[] = React.useMemo(() => {
    return threadsFromServer.slice().sort(compareLastAtDesc);
  }, [threadsFromServer]);

  const filteredThreads = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads
      .filter((t) => (tab === 'unread' ? (t.unreadCount ?? 0) > 0 : true))
      .filter((t) => {
        if (!q) return true;
        return (
          t.user.name.toLowerCase().includes(q) || (t.lastMessage ?? '').toLowerCase().includes(q)
        );
      });
  }, [threads, query, tab]);

  const activeThreadBase = React.useMemo(
    () => threads.find((t) => t.id === effectiveActiveId),
    [threads, activeId],
  );

  const activeThread: MessageThread | undefined = React.useMemo(() => {
    if (!activeThreadBase) return undefined;

    const baseMessages = detail ? mapDetailMessages(detail, myUserId) : [];
    const appended = liveMessages[activeThreadBase.id] ?? [];

    const baseIds = new Set(baseMessages.map((m) => m.id));
    const merged = [...baseMessages, ...appended.filter((m) => !baseIds.has(m.id))];

    return { ...activeThreadBase, messages: merged };
  }, [activeThreadBase, detail, myUserId, liveMessages]);

  // ---------------------------------------------------------------------------
  // 6) URL -> activeId sync
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    if (!threadIdFromQuery) return;
    const id = String(threadIdFromQuery);
    setActiveId((prev) => (prev === id ? prev : id));

    const exists = threadsFromServer.some((t) => t.id === id);
    if (!exists) refetchThreads();
  }, [threadIdFromQuery, threadsFromServer, refetchThreads]);

  // ---------------------------------------------------------------------------
  // 7) Incoming WS message handler (정답)
  // ---------------------------------------------------------------------------
  const handleIncoming = React.useCallback(
    (dto: MessagePushDto) => {
      const threadId = String(dto.messageThreadId);
      const chatMsg = pushToChatMessage(dto, myUserId);

      // ✅ active 방이면: 채팅창 즉시 업데이트 + 읽음 처리
      if (threadId === effectiveActiveId) {
        setLiveMessages((prev) => {
          const cur = prev[threadId] ?? [];
          if (cur.some((m) => m.id === chatMsg.id)) return prev;
          return { ...prev, [threadId]: [...cur, chatMsg] };
        });

        scheduleMarkRead(threadId, dto.id);
      }

      // ✅ unreadCount는 절대 로컬로 만지지 않는다.
      //    서버 list가 계산한 unreadCount로 맞춘다.
      dirtyRef.current.add(threadId);
      scheduleThreadsSync();

      // ✅ 자동으로 채팅창 들어가지 않음 (요구사항 4)
    },
    [activeId, myUserId, scheduleMarkRead, scheduleThreadsSync],
  );

  // ---------------------------------------------------------------------------
  // 8) STOMP client connect
  // ---------------------------------------------------------------------------
  const clientRef = React.useRef<ReturnType<typeof createStompClient> | null>(null);
  const inboxSubRef = React.useRef<StompSubscription | null>(null);

  React.useEffect(() => {
    if (!isLogin || myUserId === -1) return;
    if (clientRef.current) return;

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      try {
        inboxSubRef.current?.unsubscribe();
      } catch {}
      inboxSubRef.current = client.subscribe(`/sub/users.${myUserId}`, (msg) => {
        const dto = safeJsonParse<MessagePushDto>(msg.body);
        if (!dto) return;
        handleIncoming(dto);
      });
    };

    client.onStompError = (frame) => {
      console.error('[stomp error]', frame.headers['message'], frame.body);
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
  }, [isLogin, myUserId, handleIncoming]);

  // ---------------------------------------------------------------------------
  // 9) When user opens a thread: optimistic unread reset in UI는 하지 말고
  //    markRead + 서버 list로 동기화하는 게 안전.
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    if (!activeId) return;
    if (!detail) return;

    const last = detail.messages?.[detail.messages.length - 1];
    const lastId = last?.id;
    if (typeof lastId === 'number' && lastId > 0) {
      scheduleMarkRead(effectiveActiveId, lastId);
    }
  }, [activeId, detail, scheduleMarkRead]);

  // ---------------------------------------------------------------------------
  // 10) Actions
  // ---------------------------------------------------------------------------
  const [creating, setCreating] = React.useState(false);

  const onSelectUser = React.useCallback(
    async (u: FollowingUser) => {
      if (creating) return;
      if (myUserId <= 0) return;

      setCreating(true);
      try {
        const created = await messagesApi.createThreadWithMe(myUserId, u.id);
        setNewOpen(false);
        router.push(`/messages/?threadId=${created.messageThreadId}`);
        queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
      } catch (e) {
        console.warn('[create thread failed]', e);
      } finally {
        setCreating(false);
      }
    },
    [creating, myUserId, router, queryClient],
  );

  const onNewThread = React.useCallback((el: HTMLElement | null) => {
    setAnchorEl(el);
    setNewOpen(true);
  }, []);

  const leaveActiveThread = React.useCallback(async () => {
    const threadIdNum = activeId ? Number(activeId) : 0;
    if (!threadIdNum) return;

    try {
      await messagesApi.leaveThread(threadIdNum);

      // ✅ URL 제거 + 선택 해제 (요구사항 4 만족)
      router.replace('/messages');
      setActiveId('');

      // ✅ liveMessages만 정리 (이전 메시지 섞이는 거 방지)
      setLiveMessages((prev) => {
        const copy = { ...prev };
        delete copy[String(threadIdNum)];
        return copy;
      });

      // ✅ 캐시 정리 + 서버 list로 동기화
      queryClient.removeQueries({ queryKey: ['messageThread', threadIdNum] });
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
    } catch (e) {
      console.warn('[leave thread failed]', e);
    }
  }, [activeId, queryClient, router]);

  const onSend = React.useCallback(
    (content: string) => {
      const client = clientRef.current;
      if (!client || !client.connected) return;
      if (!activeId) return;

      if (!content.replace(/\s/g, '').length) return;

      client.publish({
        destination: '/pub/messages.send',
        body: JSON.stringify({
          meId: myUserId,
          messageThreadId: Number(activeId),
          content,
        }),
      });
    },
    [activeId, myUserId],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main className="min-h-dvh px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-white" />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[#2979FF]">MESSAGES</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">메시지</h1>
            <p className="mt-2 text-sm text-slate-600">
              대화 속에서 숏로그/블로그를 공유하고, 바로 이어서 읽어보세요.
            </p>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr] lg:h-[calc(100dvh-220px)]">
          <aside className="min-w-0 min-h-0">
            <ThreadList
              threads={filteredThreads}
              activeId={effectiveActiveId}
              query={query}
              onQueryChange={setQuery}
              tab={tab}
              onTabChange={setTab}
              onSelect={setActiveId}
              onNewThread={onNewThread}
            />
            {listLoading ? <p className="mt-2 text-[12px] text-slate-500">불러오는 중…</p> : null}
            {listError ? <p className="mt-2 text-[12px] text-rose-600">목록 로딩 실패</p> : null}
          </aside>

          <div className="min-w-0 min-h-0">
            <ChatPanel
              thread={activeThread}
              onSend={onSend}
              onCloseThread={() => setActiveId('')}
              onLeave={leaveActiveThread}
            />
            {detailLoading ? <p className="mt-2 text-[12px] text-slate-500">대화 로딩…</p> : null}
            {detailError ? <p className="mt-2 text-[12px] text-rose-600">대화 로딩 실패</p> : null}
          </div>
        </section>
      </div>

      <NewThreadModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        users={followingUsers}
        query={newQ}
        onQueryChange={setNewQ}
        loading={followingLoading || creating}
        error={followingIsError ? '팔로잉 목록을 불러오지 못했어요.' : null}
        onSelectUser={onSelectUser}
        anchorEl={anchorEl}
      />
    </main>
  );
}
