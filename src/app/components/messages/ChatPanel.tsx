'use client';

import type { ChatMessage, MessageThread } from '@/src/types/messages';
import * as React from 'react';

const AVATAR = 32;
const AVATAR_GAP = 8;
const BOTTOM_THRESHOLD = 24;

function isNearBottom(el: HTMLDivElement) {
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
  return distance <= BOTTOM_THRESHOLD;
}
function scrollToBottom(el: HTMLDivElement) {
  el.scrollTop = el.scrollHeight;
}

// ---- time/date utils
function toDate(input?: string | null) {
  if (!input) return null;
  const t = Date.parse(input);
  if (Number.isNaN(t)) return null;
  return new Date(t);
}
function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function ymdKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function fmtDate(d: Date) {
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}
function fmtTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function minuteKey(d: Date) {
  // 분 단위 그룹 키
  return `${ymdKey(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function Avatar({ src, alt, hidden }: { src: string; alt: string; hidden: boolean }) {
  return (
    <div className="h-8 w-8 shrink-0">
      <div
        className={[
          'h-8 w-8 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-200',
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

function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center justify-center">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200/70">
        {label}
      </span>
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
      className={[
        'group block max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70',
        'transition hover:-translate-y-[1px] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35',
      ].join(' ')}
      aria-label={`${badge} 콘텐츠 열기: ${s.title}`}
    >
      <div className="flex gap-4 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.thumbnailUrl ?? '/images/mock/placeholder.jpg'}
            alt={`${s.title} 썸네일`}
            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
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
          <p className="mt-1 line-clamp-2 text-[13px] text-slate-600">{s.summary}</p>
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
        'rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words',
        mine
          ? 'bg-[#2979FF] text-white shadow-sm shadow-[#2979FF]/20'
          : 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70',
      ].join(' ')}
    >
      {m.text}
    </div>
  );
}

function TimeSlot({
  label,
  show,
  align,
}: {
  label: string;
  show: boolean;
  align: 'left' | 'right';
}) {
  return (
    <span
      className={[
        'w-[42\\px] shrink-0 whitespace-nowrap pb-1 text-[11px] leading-none text-slate-400',
        align === 'left' ? 'text-right' : 'text-left',
        show ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      aria-hidden={!show}
    >
      {label}
    </span>
  );
}

function ThemRow({
  m,
  avatarUrl,
  name,
  avatarHidden,
  compactTop,
  timeLabel,
  showTime,
}: {
  m: ChatMessage;
  avatarUrl: string;
  name: string;
  avatarHidden: boolean;
  compactTop: boolean;
  timeLabel: string;
  showTime: boolean;
}) {
  return (
    <div className={compactTop ? '' : 'pt-1'}>
      <div className="flex items-start gap-2">
        <Avatar src={avatarUrl} alt={`${name} 프로필`} hidden={avatarHidden} />

        <div className="flex min-w-0 items-end gap-2">
          <div className="min-w-0 max-w-[520px]">
            <Bubble m={m} mine={false} />
          </div>

          {/* ✅ 항상 자리 확보 */}
          <TimeSlot label={timeLabel} show={showTime} align="right" />
        </div>
      </div>
    </div>
  );
}

function MeRow({
  m,
  compactTop,
  timeLabel,
  showTime,
}: {
  m: ChatMessage;
  compactTop: boolean;
  timeLabel: string;
  showTime: boolean;
}) {
  return (
    <div className={compactTop ? '' : 'pt-1'}>
      <div className="flex justify-end">
        {/* ✅ 버블 폭만으로 정렬되게 만들고, 시간은 absolute로 분리 */}
        <div className="relative max-w-[520px]">
          {showTime ? (
            <span className="absolute -left-9 bottom-1 whitespace-nowrap text-[11px] text-slate-400">
              {timeLabel}
            </span>
          ) : null}

          <Bubble m={m} mine />
        </div>
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
  onCloseThread,
  onLeave,
}: {
  thread?: MessageThread;
  onSend: (text: string) => void;
  onCloseThread: () => void;
  onLeave: (threadId: number) => Promise<void> | void;
}) {
  const [text, setText] = React.useState('');
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  const [isComposing, setIsComposing] = React.useState(false);
  const wasNearBottomRef = React.useRef(true);
  const isFirstPaintRef = React.useRef(true);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(false);
    setConfirmLeaveOpen(false);
  }, [thread?.id]);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => (wasNearBottomRef.current = isNearBottom(el));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  React.useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || !thread) return;

    isFirstPaintRef.current = true;

    let canceled = false;
    let count = 0;

    const tick = () => {
      if (canceled) return;
      scrollToBottom(el);
      if (++count < 8) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      canceled = true;
    };
  }, [thread?.id]);

  React.useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (menuBtnRef.current?.contains(t)) return;
      setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  React.useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || !thread) return;

    if (isFirstPaintRef.current) {
      isFirstPaintRef.current = false;
      return;
    }

    if (wasNearBottomRef.current) scrollToBottom(el);
  }, [thread?.messages?.length]);

  const submit = () => {
    if (!text.replace(/\s/g, '').length) return;

    // ✅ 내용은 그대로 보냄(개행 포함)
    onSend(text);
    setText('');
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    const composing = isComposing || (e.nativeEvent as any).isComposing;
    if (e.key === 'Enter' && !e.shiftKey) {
      if (composing) return;
      e.preventDefault();
      submit();
    }
  };

  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">대화를 선택해 주세요</p>
          <p className="mt-1 text-xs text-slate-500">
            왼쪽 목록에서 상대를 선택하면 메시지가 보여요.
          </p>
        </div>
      </div>
    );
  }

  const avatarUrl = thread.user.avatarUrl || '/tmpProfile.png';

  // ---- 핵심: 날짜/시간 표시 정책 적용 렌더링
  const messages = thread.messages ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="relative flex items-center border-b border-slate-200/70 p-4">
        {/* LEFT: back */}
        <div className="flex flex-1 items-center justify-start">
          <button
            type="button"
            onClick={onCloseThread}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35"
            aria-label="대화 목록으로"
            title="뒤로"
          >
            <span aria-hidden className="text-xl leading-none">
              ＜
            </span>
          </button>
        </div>

        {/* CENTER: avatar + name (true center) */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-200/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={`${thread.user.name} 프로필`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">
                {thread.user.name}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-500">대화 중</p>
            </div>
          </div>
        </div>

        {/* RIGHT: menu (kebab) */}
        <div className="relative flex flex-1 items-center justify-end">
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 rounded-xl items-center justify-center text-slate-500 transition hover:text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35"
            aria-label="대화 옵션"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="옵션"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>

          {confirmLeaveOpen ? (
            <div
              className="absolute right-4 top-14 z-50 w-[280px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/70"
              role="dialog"
              aria-label="채팅방 나가기 확인"
            >
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">채팅방을 나갈까요?</p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  상대방은 나간 사실을 알 수 없어요.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 px-3 py-3">
                <button
                  type="button"
                  onClick={() => setConfirmLeaveOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={leaving}
                  onClick={async () => {
                    if (!thread?.id) return;
                    setLeaving(true);
                    try {
                      await onLeave(Number(thread.id));
                      setConfirmLeaveOpen(false);
                    } finally {
                      setLeaving(false);
                    }
                  }}
                  className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                >
                  {leaving ? '나가는 중…' : '나가기'}
                </button>
              </div>
            </div>
          ) : null}

          {menuOpen ? (
            <div
              ref={menuRef}
              role="menu"
              className="absolute right-10 z-20 w-24 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/70"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmLeaveOpen(true);
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35"
              >
                <span aria-hidden className="text-slate-400">
                  ⎋
                </span>
                나가기
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-white px-4 py-5 [overflow-anchor:none]"
      >
        <div className="flex flex-col gap-1">
          {messages.map((m, idx) => {
            const prev = messages[idx - 1];
            const next = messages[idx + 1];

            const d = toDate(m.at);
            const dPrev = toDate(prev?.at);
            const dNext = toDate(next?.at);

            // 날짜 divider: "오늘이 아닌 날짜"에서, 날짜가 바뀌는 지점에 표시
            const showDateDivider = !!d && (!dPrev || ymdKey(dPrev) !== ymdKey(d));

            // 시간 표시: 오늘이면 HH:MM
            // 같은 "분(minuteKey) + 같은 sender"로 다음 메시지가 이어지면 지금은 숨기고,
            // 그룹 마지막에만 시간을 찍는다.
            const timeLabel = d ? fmtTime(d) : (m.at ?? '');
            const curMinuteKey = d ? minuteKey(d) : null;
            const nextMinuteKey = dNext ? minuteKey(dNext) : null;

            const sameMinuteNext =
              !!curMinuteKey &&
              !!nextMinuteKey &&
              curMinuteKey === nextMinuteKey &&
              next?.sender === m.sender;

            const showTime = !!d ? !sameMinuteNext : false;

            const groupedBySender = isSameSender(prev, m);
            const compactTop = groupedBySender;

            return (
              <React.Fragment key={m.id}>
                {showDateDivider ? <DateDivider label={fmtDate(d!)} /> : null}

                {m.sender === 'them' ? (
                  <ThemRow
                    m={m}
                    avatarUrl={avatarUrl}
                    name={thread.user.name}
                    avatarHidden={groupedBySender}
                    compactTop={compactTop}
                    timeLabel={timeLabel}
                    showTime={showTime}
                  />
                ) : (
                  <MeRow m={m} compactTop={compactTop} timeLabel={timeLabel} showTime={showTime} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200/70 p-4">
        <div className="flex items-end gap-3 rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200/70 focus-within:ring-2 focus-within:ring-[#2979FF]/30">
          <label className="sr-only" htmlFor="composer">
            메시지 입력
          </label>
          <textarea
            id="composer"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="메시지를 입력하세요"
            className="max-h-28 min-h-[44px] w-full resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={text.trim().length === 0}
            className={[
              'shrink-0 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold',
              'bg-[#2979FF] text-white shadow-sm shadow-[#2979FF]/20 transition',
              'hover:-translate-y-[1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35',
            ].join(' ')}
            aria-label="메시지 보내기"
          >
            전송
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Enter 전송 · Shift+Enter 줄바꿈</p>
      </div>
    </div>
  );
}
