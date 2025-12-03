'use client';

import ChatPanel from '@/src/app/components/messages/ChatPanel';
import ThreadList from '@/src/app/components/messages/ThreadList';
import type { ChatMessage, MessageThread } from '@/src/types/messages';
import * as React from 'react';

type Props = {
  initialThreads: MessageThread[];
};

export default function MessagesShell({ initialThreads }: Props) {
  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState<'all' | 'unread'>('all');
  const [threads, setThreads] = React.useState<MessageThread[]>(initialThreads);
  const [activeId, setActiveId] = React.useState<string>(initialThreads[0]?.id ?? '');

  const activeThread = threads.find((t) => t.id === activeId);

  const filteredThreads = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads
      .filter((t) => (tab === 'unread' ? t.unreadCount > 0 : true))
      .filter((t) => {
        if (!q) return true;
        return (
          t.user.name.toLowerCase().includes(q) ||
          (t.user.handle ?? '').toLowerCase().includes(q) ||
          t.lastMessage.toLowerCase().includes(q)
        );
      });
  }, [threads, query, tab]);

  const onSelectThread = (id: string) => {
    setActiveId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t)));
  };

  const onSend = (text: string) => {
    if (!activeThread) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      text: trimmed,
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id !== activeThread.id
          ? t
          : { ...t, lastMessage: trimmed, lastAt: '방금', messages: [...t.messages, newMsg] },
      ),
    );
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      {/* 배경 */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white" />

      {/* ✅ 프로필 페이지처럼 "최대 폭 + 가운데 정렬" */}
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.18em] text-[#2979FF]">MESSAGES</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">메시지</h1>
            <p className="mt-2 text-sm text-slate-600">
              대화 속에서 숏로그/블로그를 공유하고, 바로 이어서 읽어보세요.
            </p>
          </div>

          <button
            type="button"
            className="rounded-full bg-[#2979FF] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#2979FF]/20 transition hover:translate-y-[-1px] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/40"
            aria-label="새 메시지 시작"
          >
            + 새 메시지
          </button>
        </div>

        {/* ✅ grid 대신 "고정폭 + 유연폭" : 큰 화면에서도 패널이 무한 확장 안 함 */}
        <section className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-[380px] lg:shrink-0">
            <ThreadList
              threads={filteredThreads}
              activeId={activeId}
              query={query}
              onQueryChange={setQuery}
              tab={tab}
              onTabChange={setTab}
              onSelect={onSelectThread}
            />
          </aside>

          <div className="min-w-0 flex-1">
            <ChatPanel thread={activeThread} onSend={onSend} />
          </div>
        </section>
      </div>
    </main>
  );
}
