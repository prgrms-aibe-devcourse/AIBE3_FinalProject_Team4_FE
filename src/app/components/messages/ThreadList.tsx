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
        'rounded-full px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'bg-[#2979FF] text-white shadow-sm'
          : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
      ].join(' ')}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export default function ThreadList({
  threads,
  activeId,
  query,
  tab,
  onTabChange,
  onQueryChange,
  onSelect,
}: Props) {
  return (
    <div className="rounded-lg bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-400">
      <div className="border-b border-slate-300 p-4">
        <label className="sr-only" htmlFor="thread-search">
          대화 검색
        </label>

        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-400 focus-within:ring-2 focus-within:ring-[#2979FF]/35">
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

        <div className="mt-3 flex gap-2">
          <Pill active={tab === 'all'} onClick={() => onTabChange('all')}>
            전체
          </Pill>
          <Pill active={tab === 'unread'} onClick={() => onTabChange('unread')}>
            안 읽음
          </Pill>
        </div>
      </div>

      <div className="max-h-[calc(100vh-260px)] overflow-auto p-2">
        {threads.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm font-semibold text-slate-900">결과가 없어요</p>
            <p className="mt-1 text-xs text-slate-500">검색어를 바꿔보거나 필터를 해제해보세요.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {threads.map((t) => {
              const active = t.id === activeId;

              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(t.id)}
                    className={[
                      'w-full rounded-lg p-3 text-left transition',
                      active
                        ? 'bg-[#2979FF]/10 ring-1 ring-[#2979FF]/35'
                        : 'hover:bg-slate-50 ring-1 ring-transparent',
                    ].join(' ')}
                    aria-current={active ? 'page' : undefined}
                    aria-label={`${t.user.name} 대화 열기`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-400">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={t.user.avatarUrl ?? '/images/avatars/fallback.png'}
                              alt={`${t.user.name} 프로필`}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {t.user.name}
                            </p>
                            {t.user.handle ? (
                              <p className="truncate text-[13px] text-slate-500">{t.user.handle}</p>
                            ) : null}
                          </div>
                        </div>

                        <p className="mt-2 line-clamp-1 text-[13px] text-slate-700">
                          {t.lastMessage}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-[11px] text-slate-400">{t.lastAt}</span>
                        {t.unreadCount > 0 ? (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2979FF] px-1.5 text-[11px] font-bold text-white">
                            {t.unreadCount}
                          </span>
                        ) : null}
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
