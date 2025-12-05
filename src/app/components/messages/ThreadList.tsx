import type { MessageThread } from '@/src/types/messages';
import * as React from 'react';

type Props = {
  threads: MessageThread[];
  activeId: string;
  query: string;
  tab: 'all' | 'unread';
  onTabChange: (v: 'all' | 'unread') => void;
  onQueryChange: (v: string) => void;
  onSelect: (id: string) => void;
  onNewThread?: (anchorEl: HTMLElement | null) => void;
};

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1.5 text-[12px] font-semibold transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35',
        active
          ? 'bg-[#2979FF] text-white shadow-sm'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
      ].join(' ')}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

// ---- 날짜/시간 포맷: 오늘이면 HH:MM, 아니면 YYYY.MM.DD
function toDate(input?: string | null) {
  if (!input) return null;
  const t = Date.parse(input);
  if (Number.isNaN(t)) return null;
  return new Date(t);
}
function isToday(d: Date) {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function formatThreadMeta(lastAt?: string | null) {
  const d = toDate(lastAt);
  if (!d) return '';
  if (isToday(d)) return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}

export default function ThreadList({
  threads,
  activeId,
  query,
  tab,
  onTabChange,
  onQueryChange,
  onSelect,
  onNewThread,
}: Props) {
  const newBtnRef = React.useRef<HTMLButtonElement | null>(null);
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="border-b border-slate-200/70 p-4">
        <label className="sr-only" htmlFor="thread-search">
          대화 검색
        </label>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/70 focus-within:ring-2 focus-within:ring-[#2979FF]/30">
          <span aria-hidden className="text-slate-400">
            ⌕
          </span>
          <input
            id="thread-search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="대화 검색 (이름/내용)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Pill active={tab === 'all'} onClick={() => onTabChange('all')}>
              전체
            </Pill>
            <Pill active={tab === 'unread'} onClick={() => onTabChange('unread')}>
              안 읽음
            </Pill>
          </div>

          {onNewThread ? (
            <button
              ref={newBtnRef}
              type="button"
              onClick={(e) => onNewThread?.(e.currentTarget)}
              className={[
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold',
                'border border-[#2979FF]/30 transition',
                'hover:-translate-y-[0.5px] hover:shadow-sm',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35',
              ].join(' ')}
              aria-label="새 대화 만들기"
            >
              <span aria-hidden className="text-[13px] leading-none">
                ＋
              </span>
              새 대화
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-2">
        {threads.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-slate-900">결과가 없어요</p>
            <p className="mt-1 text-xs text-slate-500">검색어를 바꿔보거나 필터를 해제해보세요.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {threads.map((t) => {
              const active = t.id === activeId;

              // ✅ active thread는 어떤 순간에도 unread를 0으로 고정 (깜빡임 방지)
              const unreadCount = active ? 0 : (t.unreadCount ?? 0);
              const unread = unreadCount > 0;

              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(t.id)}
                    className={[
                      'group w-full rounded-2xl p-3 text-left transition',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35',
                      'hover:shadow-sm hover:shadow-slate-200/60',
                      active
                        ? 'bg-[#2979FF]/10 ring-1 ring-[#2979FF]/25'
                        : unread
                          ? 'ring-1 ring-transparent'
                          : 'ring-1 ring-transparent',
                    ].join(' ')}
                    aria-current={active ? 'page' : undefined}
                    aria-label={`${t.user.name} 대화 열기`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* left */}
                      <div className="flex min-w-0 gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.user.avatarUrl || '/tmpProfile.png'}
                            alt={`${t.user.name} 프로필`}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          {/* nickname */}
                          <p
                            className={[
                              'truncate text-sm text-slate-900',
                              unread ? 'font-bold' : 'font-semibold',
                            ].join(' ')}
                          >
                            {t.user.name}
                          </p>

                          {/* preview: nickname 바로 아래 */}
                          <p className="mt-1 line-clamp-1 text-[13px] text-slate-600">
                            {t.lastMessage}
                          </p>
                        </div>
                      </div>

                      {/* right meta */}
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-[11px] text-slate-400">
                          {formatThreadMeta(t.lastAt)}
                        </span>

                        {unreadCount > 0 ? (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2979FF] px-1.5 text-[11px] font-bold text-white shadow-sm">
                            {unreadCount}
                          </span>
                        ) : (
                          <span className="h-5" aria-hidden />
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
