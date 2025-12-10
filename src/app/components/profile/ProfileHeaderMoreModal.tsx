'use client';

import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface ProfileHeaderMoreModalProps {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onClickWithdraw: () => void;
}

export default function ProfileHeaderMoreModal({
  isOpen,
  anchorRef,
  onClose,
  onClickWithdraw,
}: ProfileHeaderMoreModalProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
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

  // 위치 계산: 열릴 때/리사이즈 때
  useLayoutEffect(() => {
    if (!isOpen) return;
    const anchor = anchorRef.current;
    const pop = popoverRef.current;
    if (!anchor || !pop) return;

    const rect = anchor.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();

    const gap = 8;

    // ✅ 하단 맞춤: popover bottom === button bottom
    let top = rect.bottom - popRect.height;

    // ✅ 오른쪽에 붙이기(원하면 left는 rect.right + gap)
    let left = rect.right + gap;

    // 화면 밖 보정(선택)
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 오른쪽 튀면 왼쪽으로
    if (left + popRect.width + margin > vw) {
      left = rect.left - popRect.width - gap;
    }
    // 위로 튀면 위 보정
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
      aria-label="더보기 메뉴"
    >
      <div className="px-3 py-2 text-xs text-slate-500">계정</div>

      <div className="px-2 pb-2">
        <button
          onClick={onClickWithdraw}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          role="menuitem"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
