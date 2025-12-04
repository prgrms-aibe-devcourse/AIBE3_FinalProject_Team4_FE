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
  const { isLogin, loginUser } = useAuth();
  const myUserId = loginUser?.id ?? -1;
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);

  const {
    data: threadsFromServer = [],
    isLoading: listLoading,
    isError: listError,
    refetch: refetchThreads,
  } = useMessageThreads();

  const onSelectUser = React.useCallback(
    async (u: FollowingUser) => {
      if (creating) return;
      if (myUserId <= 0) return; // 로그인 가드

      setCreating(true);
      try {
        const created = await messagesApi.createThreadWithMe(myUserId, u.id);

        setNewOpen(false); // 모달 닫기
        router.push(`/messages/?threadId=${created.messageThreadId}`); // ✅ 해당 채팅 열기
        refetchThreads(); // (선택) 목록 즉시 반영
      } catch (e) {
        console.warn('[create thread failed]', e);
        // TODO 토스트 처리
      } finally {
        setCreating(false);
      }
    },
    [creating, myUserId, router, refetchThreads],
  );

  const searchParams = useSearchParams();
  const threadIdFromQuery = searchParams.get('threadId');

  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState<'all' | 'unread'>('all');
  const [activeId, setActiveId] = React.useState<string>('');

  const [newQ, setNewQ] = React.useState('');
  const debouncedQ = useDebouncedValue(newQ, 250);
  const [newOpen, setNewOpen] = React.useState(false);

  const {
    data: followingDtos = [],
    isLoading: followingLoading,
    isError: followingIsError,
  } = useFollowingUsers(myUserId, debouncedQ, newOpen);

  const followingUsers: FollowingUser[] = React.useMemo(
    () =>
      followingDtos.map((u) => ({
        id: u.id,
        name: u.nickname, // ✅ DTO 필드 맞춰서 수정
        handle: u.handle ?? undefined,
        avatarUrl: u.profileImgUrl ?? undefined,
      })),
    [followingDtos],
  );

  const [threadPatch, setThreadPatch] = React.useState<Record<string, Partial<MessageThread>>>({});
  const [liveMessages, setLiveMessages] = React.useState<Record<string, ChatMessage[]>>({});

  const lastReadSentRef = React.useRef<Record<string, number>>({});
  const readTimerRef = React.useRef<number | null>(null);
  const pendingReadRef = React.useRef<{ threadId: string; lastMessageId: number } | null>(null);

  const clientRef = React.useRef<ReturnType<typeof createStompClient> | null>(null);
  const inboxSubRef = React.useRef<StompSubscription | null>(null);

  const threads: MessageThread[] = React.useMemo(() => {
    const merged = threadsFromServer.map((t) => ({ ...t, ...(threadPatch[t.id] ?? {}) }));
    return merged.slice().sort(compareLastAtDesc);
  }, [threadsFromServer, threadPatch]);

  // TODO: 추후 API로 교체
  const followingMock: FollowingUser[] = React.useMemo(
    () => [
      { id: 101, name: '지민', handle: 'jimin', avatarUrl: '/tmpProfile.png' },
      { id: 102, name: '민수', handle: 'minsu', avatarUrl: '/tmpProfile.png' },
      { id: 103, name: '서연', handle: 'seoyeon', avatarUrl: '/tmpProfile.png' },
      { id: 104, name: '현우', handle: 'hyunwoo', avatarUrl: '/tmpProfile.png' },
    ],
    [],
  );

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const onNewThread = React.useCallback((el: HTMLElement | null) => {
    setAnchorEl(el);
    setNewOpen(true);
  }, []);

  React.useEffect(() => {
    if (!threadIdFromQuery) return;
    const id = String(threadIdFromQuery);
    setActiveId((prev) => (prev === id ? prev : id));

    const exists = threadsFromServer.some((t) => t.id === id);
    if (!exists) refetchThreads();
  }, [threadIdFromQuery, threadsFromServer, refetchThreads]);

  const activeThreadBase = React.useMemo(
    () => threads.find((t) => t.id === activeId),
    [threads, activeId],
  );

  const activeThreadIdNum = activeId ? Number(activeId) : undefined;
  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
  } = useMessageThread(activeThreadIdNum);

  const activeThread: MessageThread | undefined = React.useMemo(() => {
    if (!activeThreadBase) return undefined;

    const baseMessages = detail ? mapDetailMessages(detail, myUserId) : [];
    const appended = liveMessages[activeThreadBase.id] ?? [];

    const baseIds = new Set(baseMessages.map((m) => m.id));
    const merged = [...baseMessages, ...appended.filter((m) => !baseIds.has(m.id))];

    return { ...activeThreadBase, messages: merged };
  }, [activeThreadBase, detail, myUserId, liveMessages]);

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
        } catch (e) {
          console.warn('[markRead failed]', e);
        }
      }, 250);
    },
    [myUserId],
  );

  const getServerThread = (threadId: string) => threadsFromServer.find((t) => t.id === threadId);

  const handleIncoming = React.useCallback(
    (dto: MessagePushDto) => {
      const threadId = String(dto.messageThreadId);

      const exists = threadsFromServer.some((t) => t.id === threadId);
      if (!exists) refetchThreads();

      const chatMsg = pushToChatMessage(dto, myUserId);

      setLiveMessages((prev) => {
        const cur = prev[threadId] ?? [];
        if (cur.some((m) => m.id === chatMsg.id)) return prev;
        return { ...prev, [threadId]: [...cur, chatMsg] };
      });

      setThreadPatch((prev) => {
        const serverUnread = getServerThread(threadId)?.unreadCount ?? 0;
        const patchedUnread = prev[threadId]?.unreadCount as number | undefined;
        const baseUnread = patchedUnread ?? serverUnread;

        const shouldBump = threadId !== activeId && chatMsg.sender === 'them';
        const nextUnread = shouldBump ? baseUnread + 1 : baseUnread;

        return {
          ...prev,
          [threadId]: {
            ...(prev[threadId] ?? {}),
            lastMessage: chatMsg.text ?? '',
            lastAt: chatMsg.at ?? '',
            unreadCount: nextUnread,
          },
        };
      });

      if (threadId === activeId) {
        setThreadPatch((prev) => ({
          ...prev,
          [threadId]: { ...(prev[threadId] ?? {}), unreadCount: 0 },
        }));
        scheduleMarkRead(threadId, dto.id);
      }
    },
    [threadsFromServer, refetchThreads, myUserId, activeId, scheduleMarkRead],
  );

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

  React.useEffect(() => {
    if (!activeId) return;

    setThreadPatch((prev) => ({
      ...prev,
      [activeId]: { ...(prev[activeId] ?? {}), unreadCount: 0 },
    }));

    if (!detail) return;

    const last = detail.messages?.[detail.messages.length - 1];
    const lastId = last?.id;
    if (typeof lastId === 'number' && lastId > 0) {
      scheduleMarkRead(activeId, lastId);
    }
  }, [activeId, detail, scheduleMarkRead]);

  const onSend = React.useCallback(
    (content: string) => {
      const client = clientRef.current;
      if (!client || !client.connected) return;
      if (!activeId) return;

      const trimmed = content.trim();
      if (!trimmed) return;

      client.publish({
        destination: '/pub/messages.send',
        body: JSON.stringify({
          meId: myUserId,
          messageThreadId: Number(activeId),
          content: trimmed,
        }),
      });
    },
    [activeId, myUserId],
  );

  return (
    <main className="min-h-dvh px-4 py-8 sm:px-6 lg:px-10">
      {/* background like other pages */}
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
              activeId={activeId}
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
            <ChatPanel thread={activeThread} onSend={onSend} />
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
