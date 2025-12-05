'use client';
import React, { useEffect, useState } from 'react';

export default function TestSidebarLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const [width, setWidth] = useState(360);
  const [floating, setFloating] = useState(false);
  const [dragging, setDragging] = useState(false);

  const THRESHOLD = 420; // 이 너비 넘으면 fixed 모드로 전환
  const HYSTERESIS = 24; // 왔다갔다 떨림 방지
  const RESERVED_MAX = THRESHOLD; // 본문이 밀리는 최대치(=임계치)

  // 본문이 밀려나는 "자리" 폭
  const reservedWidth = isOpen ? Math.min(width, RESERVED_MAX) : 0;

  // 너비에 따라 floating 판단
  useEffect(() => {
    if (!isOpen) {
      setFloating(false);
      return;
    }

    setFloating((prev) => {
      if (!prev && width > THRESHOLD) return true;
      if (prev && width < THRESHOLD - HYSTERESIS) return false;
      return prev;
    });
  }, [width, isOpen]);

  // 드래그 리사이즈
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const newW = window.innerWidth - e.clientX;
      const maxW = Math.min(800, window.innerWidth - 80);
      const clamped = Math.max(280, Math.min(newW, maxW));
      setWidth(clamped);
    };
    const onUp = () => setDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 테스트용 버튼 */}
      {!isOpen && (
        <button
          className="fixed right-6 bottom-6 z-50 rounded-full bg-black px-4 py-2 text-white"
          onClick={() => setIsOpen(true)}
        >
          사이드바 열기
        </button>
      )}

      {/* ✅ 전체 레이아웃: 본문 + (밀어내기용) 오른쪽 자리 */}
      <div
        className="mx-auto flex w-full max-w-5xl gap-0 px-4 pt-10"
        // reservedWidth만큼 본문이 줄어드는 효과
        style={{ paddingRight: reservedWidth }}
      >
        {/* Main */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* ✅ 실제 사이드바 */}
      {isOpen && (
        <div
          style={{ width }}
          className={[
            'bg-white border-l border-slate-200 shadow-xl',
            'top-0 right-0 h-dvh flex flex-col',

            // floating=false → 문서 흐름처럼 보이게 (본문을 밀어낸 상태)
            !floating ? 'absolute' : '',

            // floating=true → fixed로 화면 위에 떠서 오버레이
            floating ? 'fixed z-40' : 'z-10',
          ].join(' ')}
        >
          {/* 드래그 핸들 */}
          <div
            onMouseDown={() => setDragging(true)}
            className="absolute left-0 top-0 h-full w-2 cursor-col-resize bg-transparent"
          />

          {/* 헤더 */}
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="text-sm font-semibold">
              Test Sidebar {floating ? '(fixed 모드)' : '(밀어내기 모드)'}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              닫기
            </button>
          </div>

          {/* 바디 */}
          <div className="flex-1 overflow-auto p-3 text-sm">
            <p>여기는 테스트 사이드바입니다.</p>
            <p className="mt-2">
              드래그해서 너비를 키워보세요.
              <br />
              {THRESHOLD}px 넘으면 fixed로 뜹니다.
            </p>
            <p className="mt-2">현재 너비: {Math.round(width)}px</p>
          </div>
        </div>
      )}
    </div>
  );
}
