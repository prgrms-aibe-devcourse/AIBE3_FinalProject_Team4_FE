'use client';

import ChatPanel from '@/src/app/components/messages/ChatPanel';
import ThreadList from '@/src/app/components/messages/ThreadList';
import { useMessageThread } from '@/src/hooks/useMessageThread';
import { useMessageThreads } from '@/src/hooks/useMessageThreads';
import { useAuth } from '@/src/providers/AuthProvider';
import type { MessageThread } from '@/src/types/messages';
import { mapDetailMessages } from '@/src/utils/messagesMapper';
import * as React from 'react';

export default function MessagesShell() {
  const { isLogin, loginUser } = useAuth();
  const myUserId = loginUser?.id ?? -1;

  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState<'all' | 'unread'>('all');
  const [activeId, setActiveId] = React.useState<string>('');

  const { data: threads = [], isLoading: listLoading, isError: listError } = useMessageThreads();

  React.useEffect(() => {
    if (!activeId && threads.length > 0) setActiveId(threads[0].id);
  }, [threads, activeId]);

  const activeThreadBase = threads.find((t) => t.id === activeId);

  const activeThreadIdNum = activeId ? Number(activeId) : undefined;
  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
  } = useMessageThread(activeThreadIdNum);

  const activeThread: MessageThread | undefined = React.useMemo(() => {
    if (!activeThreadBase) return undefined;
    if (!detail) return activeThreadBase;

    return {
      ...activeThreadBase,
      messages: mapDetailMessages(detail, myUserId),
    };
  }, [activeThreadBase, detail, myUserId]);

  const filteredThreads = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads
      .filter((t) => (tab === 'unread' ? t.unreadCount > 0 : true))
      .filter((t) => {
        if (!q) return true;
        return t.user.name.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q);
      });
  }, [threads, query, tab]);

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
            <ChatPanel thread={activeThread} onSend={() => {}} />
            {detailLoading ? <p className="mt-2 text-[12px] text-slate-500">대화 로딩…</p> : null}
            {detailError ? <p className="mt-2 text-[12px] text-rose-600">대화 로딩 실패</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
