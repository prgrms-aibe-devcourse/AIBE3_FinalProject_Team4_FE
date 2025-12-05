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
import type { MessageThreadResponseDto } from '@/src/types/messageApi';
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

type MessageDto = MessageThreadResponseDto['messages'][number];

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

  // URL을 단일 진실로
  const activeId = threadIdFromQuery ? String(threadIdFromQuery) : '';
  const activeThreadIdNum = activeId ? Number(activeId) : undefined;

  // ---------------------------------------------------------------------------
  // 2) UI state
  // ---------------------------------------------------------------------------
  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState<'all' | 'unread'>('all');

  // new thread modal
  const [newOpen, setNewOpen] = React.useState(false);
  const [newQ, setNewQ] = React.useState('');
  const debouncedQ = useDebouncedValue(newQ, 250);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // ---------------------------------------------------------------------------
  // 3) Data queries
  // ---------------------------------------------------------------------------
  const {
    data: threadsFromServer = [],
    isLoading: listLoading,
    isError: listError,
    refetch: refetchThreads,
  } = useMessageThreads();

  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
    refetch: refetchDetail,
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
  // 4) Derived list
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

  // ---------------------------------------------------------------------------
  // 5) Active Thread (list 없어도 detail 있으면 표시)
  // ---------------------------------------------------------------------------
  const activeThread: MessageThread | undefined = React.useMemo(() => {
    if (!activeId) return undefined;
    const base = threads.find((t) => t.id === activeId);

    if (detail) {
      const mapped: ChatMessage[] = mapDetailMessages(detail, myUserId);
      const last = mapped[mapped.length - 1];
      return {
        ...(base ?? ({} as MessageThread)),
        id: activeId,
        user: base?.user ?? {
          name: detail.otherUserNickname,
          avatarUrl: detail.otherUserProfileImgUrl ?? undefined,
        },
        messages: mapped,
        lastAt: last?.at ?? base?.lastAt,
        lastMessage: last?.text ?? base?.lastMessage,
        unreadCount: base?.unreadCount ?? 0,
      } as MessageThread;
    }

    return base;
  }, [activeId, threads, detail, myUserId]);

  // ---------------------------------------------------------------------------
  // 6) markRead throttle
  // ---------------------------------------------------------------------------
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

          await queryClient.refetchQueries({ queryKey: ['messageThreads'], type: 'active' });
        } catch (e) {
          console.warn('[markRead failed]', e);
        }
      }, 250);
    },
    [myUserId, queryClient],
  );

  // 방 열었을 때 마지막 메시지 id로 읽음 처리
  React.useEffect(() => {
    if (!activeId) return;
    const msgs = activeThread?.messages ?? [];
    const last = msgs[msgs.length - 1];
    if (!last) return;

    const lastIdNum = Number(last.id);
    if (Number.isFinite(lastIdNum) && lastIdNum > 0) {
      scheduleMarkRead(activeId, lastIdNum);
    }
  }, [activeId, activeThread?.messages, scheduleMarkRead]);

  // ---------------------------------------------------------------------------
  // 7) WS 수신 캐시 업데이트 (핵심)
  // ---------------------------------------------------------------------------
  const activeIdRef = React.useRef(activeId);
  React.useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const updateCachesOnIncoming = React.useCallback(
    (dto: MessagePushDto) => {
      const threadIdNum = dto.messageThreadId;
      const threadIdStr = String(dto.messageThreadId);

      const nextMsg: MessageDto = {
        id: dto.id,
        senderId: dto.senderId,
        senderNickname: dto.senderNickname,
        profileImgUrl: dto.profileImgUrl,
        content: dto.content,
        createdAt: dto.createdAt,
      };

      queryClient.setQueryData<MessageThreadResponseDto>(['messageThread', threadIdNum], (old) => {
        if (!old) return old;
        const messages = old.messages ?? [];
        if (messages.some((m) => m.id === nextMsg.id)) return old;
        return { ...old, messages: [...messages, nextMsg] };
      });

      queryClient.setQueryData<MessageThread[]>(['messageThreads'], (old) => {
        if (!old) return old;

        const exists = old.some((t) => t.id === threadIdStr);
        if (!exists) return old;

        return old
          .map((t) =>
            t.id === threadIdStr
              ? { ...t, lastAt: nextMsg.createdAt, lastMessage: nextMsg.content }
              : t,
          )
          .slice()
          .sort(compareLastAtDesc);
      });

      if (threadIdStr === activeIdRef.current) {
        scheduleMarkRead(threadIdStr, nextMsg.id);
      }

      queryClient.refetchQueries({ queryKey: ['messageThreads'], type: 'active' });
      if (threadIdStr === activeIdRef.current) {
        queryClient.refetchQueries({ queryKey: ['messageThread', threadIdNum], type: 'active' });
      }
    },
    [queryClient, scheduleMarkRead],
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
        updateCachesOnIncoming(dto);
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
  }, [isLogin, myUserId, updateCachesOnIncoming]);

  // ---------------------------------------------------------------------------
  // 9) 페이지 진입/복귀 안정화
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    if (!isLogin || myUserId <= 0) return;
    refetchThreads();
  }, [isLogin, myUserId, refetchThreads]);

  React.useEffect(() => {
    if (!activeThreadIdNum) return;
    refetchDetail();
  }, [activeThreadIdNum, refetchDetail]);

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

        await queryClient.refetchQueries({ queryKey: ['messageThreads'], type: 'active' });
        await queryClient.refetchQueries({
          queryKey: ['messageThread', created.messageThreadId],
          type: 'active',
        });
      } catch (e) {
        console.warn('[create thread failed]', e);
      } finally {
        setCreating(false);
      }
    },
    [creating, myUserId, router, queryClient],
  );

  const { refetch: refetchFollowing } = useFollowingUsers(myUserId, debouncedQ, newOpen);

  const onNewThread = React.useCallback(
    async (el: HTMLElement | null) => {
      setAnchorEl(el);
      await refetchFollowing(); // ✅ 방금 팔로우한거 즉시 반영
      setNewOpen(true);
    },
    [refetchFollowing],
  );

  const leaveActiveThread = React.useCallback(async () => {
    const threadIdNum = activeId ? Number(activeId) : 0;
    if (!threadIdNum) return;

    try {
      await messagesApi.leaveThread(threadIdNum);

      router.replace('/messages');

      queryClient.removeQueries({ queryKey: ['messageThread', threadIdNum] });
      await queryClient.refetchQueries({ queryKey: ['messageThreads'], type: 'active' });
    } catch (e) {
      console.warn('[leave thread failed]', e);
    }
  }, [activeId, queryClient, router]);

  const optimisticAppendMyMessage = React.useCallback(
    (threadIdNum: number, content: string) => {
      if (!loginUser) return;

      const nowIso = new Date().toISOString();
      const tempId = -Date.now(); // 임시 음수 ID (number)

      const optimisticMsg: MessageDto = {
        id: tempId,
        senderId: myUserId,
        senderNickname: loginUser.nickname,
        profileImgUrl: loginUser.profileImgUrl ?? null,
        content,
        createdAt: nowIso,
      };

      queryClient.setQueryData<MessageThreadResponseDto>(['messageThread', threadIdNum], (old) => {
        if (!old) return old;
        if (old.messages?.some((m) => m.id === optimisticMsg.id)) return old;
        return { ...old, messages: [...(old.messages ?? []), optimisticMsg] };
      });

      queryClient.setQueryData<MessageThread[]>(['messageThreads'], (old) => {
        if (!old) return old;
        const idStr = String(threadIdNum);
        return old
          .map((t) => (t.id === idStr ? { ...t, lastAt: nowIso, lastMessage: content } : t))
          .slice()
          .sort(compareLastAtDesc);
      });
    },
    [queryClient, loginUser, myUserId],
  );

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

      optimisticAppendMyMessage(Number(activeId), content);

      // 혹시 push 누락되는 환경 방어
      queryClient.refetchQueries({ queryKey: ['messageThread', Number(activeId)], type: 'active' });
      queryClient.refetchQueries({ queryKey: ['messageThreads'], type: 'active' });
    },
    [activeId, myUserId, optimisticAppendMyMessage, queryClient],
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
              activeId={activeId}
              query={query}
              onQueryChange={setQuery}
              tab={tab}
              onTabChange={setTab}
              onSelect={(id) => router.push(`/messages/?threadId=${id}`)}
              onNewThread={onNewThread}
            />
            {listLoading ? <p className="mt-2 text-[12px] text-slate-500">불러오는 중…</p> : null}
            {listError ? <p className="mt-2 text-[12px] text-rose-600">목록 로딩 실패</p> : null}
          </aside>

          <div className="min-w-0 min-h-0">
            <ChatPanel
              thread={activeThread}
              onSend={onSend}
              onCloseThread={() => router.replace('/messages')}
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
