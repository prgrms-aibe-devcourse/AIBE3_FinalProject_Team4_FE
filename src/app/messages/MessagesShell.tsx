'use client';

import apiClient from '@/src/api/clientForRs';
import ChatPanel from '@/src/app/components/messages/ChatPanel';
import ThreadList from '@/src/app/components/messages/ThreadList';
import { useMessageThread } from '@/src/hooks/useMessageThread';
import { useMessageThreads } from '@/src/hooks/useMessageThreads';
import { createStompClient } from '@/src/lib/wsClient';
import { useAuth } from '@/src/providers/AuthProvider';
import type { ChatMessage, MessageThread } from '@/src/types/messages';
import { mapDetailMessages } from '@/src/utils/messagesMapper';
import type { StompSubscription } from '@stomp/stompjs';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';

type MessagePushDto = {
  id: number;
  messageThreadId: number;
  senderId: number;
  senderNickname: string;
  profileImgUrl: string | null;
  content: string;
  createdAt: string; // ISO
};

type ReadMessageThreadRequestDto = {
  lastMessageId?: number | null;
};

type ReadMessageThreadResponseDto = {
  messageThreadId: number;
  lastReadMessageId: number;
};

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

  // 너가 말한 방식: param으로 받음
  // POST /message-threads/{threadId}/read?meId=41
  // body: { lastMessageId }
  await apiClient<ReadMessageThreadResponseDto>(`/message-threads/${threadId}/read`, {
    method: 'POST',
    params: { meId: String(meId) },
    body: JSON.stringify({ lastMessageId } satisfies ReadMessageThreadRequestDto),
  });
}

export default function MessagesShell() {
  const { isLogin, loginUser } = useAuth();
  const myUserId = loginUser?.id ?? -1;

  const searchParams = useSearchParams();
  const threadIdFromQuery = searchParams.get('threadId'); // string | null

  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState<'all' | 'unread'>('all');
  const [activeId, setActiveId] = React.useState<string>('');

  // ✅ 서버 목록
  const {
    data: threadsFromServer = [],
    isLoading: listLoading,
    isError: listError,
    refetch: refetchThreads,
  } = useMessageThreads();

  // ✅ 리스트 실시간 변경분 patch
  const [threadPatch, setThreadPatch] = React.useState<Record<string, Partial<MessageThread>>>({});

  // ✅ 채팅창 실시간 메시지 누적
  const [liveMessages, setLiveMessages] = React.useState<Record<string, ChatMessage[]>>({});

  // ✅ activeId별로 "마지막으로 읽음 처리한 메시지 id"를 기억해서 중복 호출 방지
  const lastReadSentRef = React.useRef<Record<string, number>>({});
  // ✅ read 호출 너무 잦은 것 방지(쓰로틀)
  const readTimerRef = React.useRef<number | null>(null);
  const pendingReadRef = React.useRef<{ threadId: string; lastMessageId: number } | null>(null);

  const clientRef = React.useRef<ReturnType<typeof createStompClient> | null>(null);
  const inboxSubRef = React.useRef<StompSubscription | null>(null);

  // ✅ 서버 목록 + patch 합쳐서 화면용 threads 만들기 (정렬 포함)
  const threads: MessageThread[] = React.useMemo(() => {
    const merged = threadsFromServer.map((t) => ({ ...t, ...(threadPatch[t.id] ?? {}) }));
    return merged.slice().sort(compareLastAtDesc);
  }, [threadsFromServer, threadPatch]);

  // ✅ 1) 쿼리에 threadId가 있으면 그걸 우선 선택 + 목록에 없으면 refetch
  React.useEffect(() => {
    if (!threadIdFromQuery) return;

    const id = String(threadIdFromQuery);

    // 우선 active 선택(한 번만 바뀌게)
    setActiveId((prev) => (prev === id ? prev : id));

    // 목록에 없으면 한 번 더 당겨오기
    const exists = threadsFromServer.some((t) => t.id === id);
    if (!exists) {
      refetchThreads();
    }
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

  // ✅ 상세 + live merge
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

  // ✅ 읽음 호출(스로틀 + 중복 방지)
  const scheduleMarkRead = React.useCallback(
    (threadId: string, lastMessageId: number) => {
      if (!threadId || myUserId <= 0) return;

      const lastSent = lastReadSentRef.current[threadId] ?? 0;
      if (lastMessageId <= lastSent) return; // 되돌림/중복 방지

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
          // MVP: 실패해도 UI는 유지, 다음 기회에 다시 시도되면 됨
          console.warn('[markRead failed]', e);
        }
      }, 250); // 250ms 정도로 충분히 가볍게
    },
    [myUserId],
  );

  const getServerThread = (threadId: string) => threadsFromServer.find((t) => t.id === threadId);

  const handleIncoming = React.useCallback(
    (dto: MessagePushDto) => {
      const threadId = String(dto.messageThreadId); // ✅ 먼저 선언!

      const exists = threadsFromServer.some((t) => t.id === threadId);
      if (!exists) {
        refetchThreads();
      }

      const chatMsg = pushToChatMessage(dto, myUserId);

      // 이하 동일...
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

  // ✅ STOMP 연결 + 인박스 구독(한 번)
  React.useEffect(() => {
    if (!isLogin || myUserId === -1) return;
    if (clientRef.current) return;

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      console.log('[stomp] connected, subscribing inbox:', `/sub/users.${myUserId}`);
      try {
        inboxSubRef.current?.unsubscribe();
      } catch {}
      inboxSubRef.current = client.subscribe(`/sub/users.${myUserId}`, (msg) => {
        console.log('[stomp] inbox raw:', msg.body); // ✅ 무조건 찍기
        const dto = safeJsonParse<MessagePushDto>(msg.body);
        if (!dto) {
          console.warn('[stomp] inbox parse fail');
          return;
        }
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

  // ✅ 방 들어가면 unread 0 + 서버에 read 한번 쏘기(상세 로드 후)
  React.useEffect(() => {
    if (!activeId) return;

    // UI 배지 바로 0
    setThreadPatch((prev) => ({
      ...prev,
      [activeId]: { ...(prev[activeId] ?? {}), unreadCount: 0 },
    }));

    // detail이 아직 없으면 마지막 메시지 id를 모르니, detail 로드되면 처리
    if (!detail) return;

    // detail 기준 마지막 메시지 id
    const last = detail.messages?.[detail.messages.length - 1];
    const lastId = last?.id;
    if (typeof lastId === 'number' && lastId > 0) {
      scheduleMarkRead(activeId, lastId);
    }
  }, [activeId, detail, scheduleMarkRead]);

  // ✅ 전송: /pub/messages.send
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
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white" />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.18em] text-[#2979FF]">MESSAGES</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">메시지</h1>
            <p className="mt-2 text-sm text-slate-600">
              대화 속에서 숏로그/블로그를 공유하고, 바로 이어서 읽어보세요.
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-[380px] lg:shrink-0">
            <ThreadList
              threads={filteredThreads}
              activeId={activeId}
              query={query}
              onQueryChange={setQuery}
              tab={tab}
              onTabChange={setTab}
              onSelect={setActiveId}
            />
            {listLoading ? <p className="mt-2 text-[12px] text-slate-500">불러오는 중…</p> : null}
            {listError ? <p className="mt-2 text-[12px] text-rose-600">목록 로딩 실패</p> : null}
          </aside>

          <div className="min-w-0 flex-1">
            <ChatPanel thread={activeThread} onSend={onSend} />
            {detailLoading ? <p className="mt-2 text-[12px] text-slate-500">대화 로딩…</p> : null}
            {detailError ? <p className="mt-2 text-[12px] text-rose-600">대화 로딩 실패</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
