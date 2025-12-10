'use client';

import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface ProfileHeaderOtherMoreModalProps {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

export default function ProfileHeaderOtherMoreModal({
  isOpen,
  anchorRef,
  onClose,
}: ProfileHeaderOtherMoreModalProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;

      const pop = popoverRef.current;
      const anchor = anchorRef.current;
      if (pop && !pop.contains(t) && anchor && !anchor.contains(t)) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [isOpen, onClose, anchorRef]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const anchor = anchorRef.current;
    const pop = popoverRef.current;
    if (!anchor || !pop) return;

    const rect = anchor.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();

    const gap = 8;

    // ✅ 버튼 하단과 팝오버 하단 맞추기
    let top = rect.bottom - popRect.height;
    let left = rect.right + gap;

    // 화면 밖 보정
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (left + popRect.width + margin > vw) {
      left = rect.left - popRect.width - gap;
    }
    top = Math.max(margin, Math.min(top, vh - popRect.height - margin));

    setPos({ top, left });
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 w-[220px] rounded-xl border border-slate-200 bg-white shadow-lg"
      style={{ top: pos.top, left: pos.left }}
      role="menu"
      aria-label="프로필 더보기 메뉴"
    >
      <div className="px-3 py-2 text-xs text-slate-500">사용자</div>

      <div className="px-2 pb-2 flex flex-col gap-1">
        <button
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
          role="menuitem"
        >
          신고 <span className="ml-1 text-xs text-slate-400">(개발중)</span>
        </button>

        <button
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
          role="menuitem"
        >
          차단 <span className="ml-1 text-xs text-slate-400">(개발중)</span>
        </button>
      </div>
    </div>
  );
}
