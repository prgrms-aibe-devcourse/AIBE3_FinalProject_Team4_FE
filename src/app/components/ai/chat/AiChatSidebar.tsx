'use client';
import { useEffect, useRef, useState } from 'react';
import AIChat from './AiChatBody';
import AiChatHeader from './AiChatHeader';

interface AiChatSidebarProps {
  onToggleMode: () => void;
  onClose: () => void;
}

export default function AiChatSidebar({ onToggleMode, onClose }: AiChatSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(384); // 기본 w-96 (384px)
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.min(800, window.innerWidth - 100);
      if (newWidth >= 300 && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // 브라우저 창 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.min(800, window.innerWidth - 100);
      if (sidebarWidth > maxWidth) {
        setSidebarWidth(maxWidth);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarWidth]);

  return (
    <div
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className="
        h-dvh
        bg-white shadow-2xl border-l border-gray-200
        flex flex-col flex-shrink-0
        sticky top-0
        max-[960px]:fixed max-[960px]:right-0 max-[960px]:inset-y-0 max-[960px]:z-50 max-[960px]:w-96
        relative
      "
    >
      {/* 리사이저 핸들 */}
      <div
        onMouseDown={startResizing}
        className="
          absolute left-0 top-0 bottom-0 w-1 cursor-col-resize
          hover:bg-blue-400 transition-colors
          max-[960px]:hidden
        "
      />

      <AiChatHeader mode="sidebar" onToggleMode={onToggleMode} onClose={onClose} />

      {/* AI 채팅 컴포넌트 (내부만 스크롤) */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <AIChat />
      </div>
    </div>
  );
}
