'use client';

import * as React from 'react';

export type FollowingUser = {
  id: number;
  name: string;
  handle?: string;
  avatarUrl?: string | null;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function NewThreadModal({
  open,
  onClose,
  users,
  query,
  onQueryChange,
  loading,
  error,
  onSelectUser,
  anchorEl, // ✅ 추가
  title = '새 대화',
}: {
  open: boolean;
  onClose: () => void;
  users: FollowingUser[];
  query: string;
  onQueryChange: (v: string) => void;
  loading?: boolean;
  error?: string | null;
  onSelectUser: (user: FollowingUser) => void;
  anchorEl: HTMLElement | null; // ✅ 추가
  title?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);

  const updatePos = React.useCallback(() => {
    if (!anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    // ✅ 버튼 좌상단 == 팝오버 좌상단
    setPos({ top: r.top + 35, left: r.left });
  }, [anchorEl]);

  React.useEffect(() => {
    if (!open) return;
    updatePos();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, updatePos]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onReflow = () => updatePos();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open, onClose, updatePos]);

  // 바깥 클릭 닫기
  const onBackdropMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!panelRef.current) return;
    if (panelRef.current.contains(e.target as Node)) return;
    onClose();
  };

  const filtered = React.useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return users;

    return users.filter((u) => {
      const name = (u.name ?? '').toLowerCase();
      const handle = (u.handle ?? '').toLowerCase();

      // "@"까지 입력하는 사용자도 있어서 둘 다 매칭
      return name.includes(s) || handle.includes(s) || `@${handle}`.includes(s);
    });
  }, [users, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onMouseDown={onBackdropMouseDown}>
      {/* Backdrop: 완전 모달 느낌이 싫으면 투명도를 더 낮춰도 됨 */}
      <div className="absolute inset-0" />

      <div
        ref={panelRef}
        className={cx('absolute w-[360px] rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/70')}
        style={{
          top: pos?.top ?? 80,
          left: pos?.left ?? 80,
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[#2979FF]">NEW THREAD</p>
            <h2 className="mt-0.5 truncate text-base font-bold text-slate-900">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/70 focus-within:ring-2 focus-within:ring-[#2979FF]/30">
            <span aria-hidden className="text-slate-400">
              ⌕
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="팔로잉 검색"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="max-h-[360px] overflow-auto px-2 pb-2">
          {loading ? (
            <div className="px-3 py-10 text-center">
              <p className="text-sm font-semibold text-slate-900">불러오는 중…</p>
              <p className="mt-1 text-xs text-slate-500">팔로잉 목록을 불러오고 있어요.</p>
            </div>
          ) : error ? (
            <div className="px-3 py-10 text-center">
              <p className="text-sm font-semibold text-slate-900">불러오지 못했어요</p>
              <p className="mt-1 text-xs text-slate-500">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm font-semibold text-slate-900">검색 결과가 없어요</p>
              <p className="mt-1 text-xs text-slate-500">다른 키워드로 다시 검색해보세요.</p>
            </div>
          ) : (
            <ul className="space-y-1 px-2 pb-2">
              {filtered.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => onSelectUser(u)}
                    className={cx(
                      'group w-full rounded-2xl px-3 py-3 text-left transition',
                      'hover:bg-slate-50 hover:shadow-sm hover:shadow-slate-200/60',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]/35',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-200">
                        <img
                          src={u.avatarUrl || '/tmpProfile.png'}
                          alt={`${u.name} 프로필`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
                        <p className="mt-0.5 truncate text-[12px] text-slate-500">
                          {u.handle ? `@${u.handle}` : ' '}
                        </p>
                      </div>
                      <span className="ml-auto text-[12px] font-semibold text-[#2979FF] opacity-0 transition group-hover:opacity-100">
                        선택
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200/70 px-4 py-2">
          <p className="text-[11px] text-slate-400">ESC로 닫기</p>
        </div>
      </div>
    </div>
  );
}
