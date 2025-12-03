'use client';

import type { ChatMessage, MessageThread } from '@/src/types/messages';
import * as React from 'react';

const AVATAR = 32;
const AVATAR_GAP = 8;

function Avatar({ src, alt, hidden }: { src: string; alt: string; hidden: boolean }) {
  return (
    <div className="h-8 w-8 shrink-0">
      <div
        className={[
          'h-8 w-8 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-300',
          hidden ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
        aria-hidden={hidden}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

function SharedCard({ m }: { m: ChatMessage }) {
  const s = m.shared!;
  const badge = s.type === 'shorlog' ? 'SHORLOG' : 'BLOG';
  const badgeCls =
    s.type === 'shorlog' ? 'bg-[#2979FF]/10 text-[#2979FF]' : 'bg-emerald-50 text-emerald-700';

  return (
    <a
      href={s.href}
      className="group block max-w-[520px] rounded-lg bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-300 transition hover:translate-y-[-1px] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/40"
      aria-label={`${badge} 콘텐츠 열기: ${s.title}`}
    >
      <div className="flex gap-4 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.thumbnailUrl ?? '/images/mock/placeholder.jpg'}
            alt={`${s.title} 썸네일`}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${badgeCls}`}>
              {badge}
            </span>
            <span className="text-[11px] text-slate-500">자세히 보기 →</span>
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900">{s.title}</p>
          <p className="mt-1 line-clamp-2 text-[13px] text-slate-700">{s.summary}</p>
        </div>
      </div>
    </a>
  );
}

function Bubble({ m, mine }: { m: ChatMessage; mine: boolean }) {
  if (m.shared) return <SharedCard m={m} />;

  return (
    <div
      className={[
        'rounded-lg px-4 py-3 text-sm ring-1',
        mine
          ? 'bg-[#2979FF] text-white ring-[#2979FF]/30 shadow-sm shadow-[#2979FF]/20'
          : 'bg-white text-slate-900 ring-slate-300 shadow-sm shadow-slate-200/40',
      ].join(' ')}
    >
      {m.text}
    </div>
  );
}

function ThemRow({
  m,
  avatarUrl,
  name,
  avatarHidden,
  compactTop,
}: {
  m: ChatMessage;
  avatarUrl: string;
  name: string;
  avatarHidden: boolean;
  compactTop: boolean;
}) {
  return (
    <div className={compactTop ? 'mt-1' : 'mt-4'}>
      <div className="flex items-end gap-2">
        <Avatar src={avatarUrl} alt={`${name} 프로필`} hidden={avatarHidden} />
        <Bubble m={m} mine={false} />
      </div>

      <div className="mt-1" style={{ paddingLeft: AVATAR + AVATAR_GAP }}>
        <p
          className={['text-[11px] text-slate-500', compactTop ? 'opacity-60' : 'opacity-100'].join(
            ' ',
          )}
        >
          {m.at}
        </p>
      </div>
    </div>
  );
}

function MeRow({ m, compactTop }: { m: ChatMessage; compactTop: boolean }) {
  return (
    <div className={compactTop ? 'mt-1' : 'mt-4'}>
      <div className="flex justify-end">
        <Bubble m={m} mine />
      </div>
      <div className="mt-1 flex justify-end">
        <p
          className={['text-[11px] text-slate-500', compactTop ? 'opacity-60' : 'opacity-100'].join(
            ' ',
          )}
        >
          {m.at}
        </p>
      </div>
    </div>
  );
}

function isSameSender(a?: ChatMessage, b?: ChatMessage) {
  if (!a || !b) return false;
  return a.sender === b.sender;
}

export default function ChatPanel({
  thread,
  onSend,
}: {
  thread?: MessageThread;
  onSend: (text: string) => void;
}) {
  const [text, setText] = React.useState('');
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    requestAnimationFrame(() => {
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, [thread?.id, thread?.messages.length]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  if (!thread) {
    return (
      <div className="flex h-[calc(100vh-220px)] items-center justify-center rounded-lg bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-400">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">대화를 선택해 주세요</p>
          <p className="mt-1 text-xs text-slate-500">
            왼쪽 목록에서 상대를 선택하면 메시지가 보여요.
          </p>
        </div>
      </div>
    );
  }

  const avatarUrl = thread.user.avatarUrl ?? '/images/avatars/fallback.png';

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col overflow-hidden rounded-lg bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-400">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={`${thread.user.name} 프로필`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{thread.user.name}</p>
            <p className="truncate text-[13px] text-slate-600">
              {thread.user.handle ?? 'TexTok 사용자'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-full px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/40"
          aria-label="대화 옵션"
        >
          ···
        </button>
      </div>

      <div ref={scrollerRef} className="flex-1 overflow-auto bg-slate-50 px-4 py-5">
        <div className="space-y-0">
          {thread.messages.map((m, idx) => {
            const prev = thread.messages[idx - 1];
            const grouped = isSameSender(prev, m);
            const compactTop = grouped;

            if (m.sender === 'them') {
              return (
                <ThemRow
                  key={m.id}
                  m={m}
                  avatarUrl={avatarUrl}
                  name={thread.user.name}
                  avatarHidden={grouped}
                  compactTop={compactTop}
                />
              );
            }
            return <MeRow key={m.id} m={m} compactTop={compactTop} />;
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-end gap-3 rounded-xl bg-white px-3 py-3 ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-[#2979FF]/35">
          <label className="sr-only" htmlFor="composer">
            메시지 입력
          </label>
          <textarea
            id="composer"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="메시지를 입력하세요… (Enter 전송 / Shift+Enter 줄바꿈)"
            className="max-h-28 min-h-[44px] w-full resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={text.trim().length === 0}
            className="rounded-lg bg-[#2979FF] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#2979FF]/20 transition hover:translate-y-[-1px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/40"
            aria-label="메시지 보내기"
          >
            전송
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">Enter 전송 · Shift+Enter 줄바꿈</p>
      </div>
    </div>
  );
}
