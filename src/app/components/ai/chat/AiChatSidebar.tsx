'use client';
import { useAiChatStreamMutation } from '@/src/api/useAiChatStream';
import { useEffect, useRef, useState } from 'react';
import Tooltip from '../../common/Tooltip';
import AiChatBody from './AiChatBody';
import AiChatHeader from './AiChatHeader';

interface AiChatSidebarProps {
  onToggleMode: () => void;
  onClose: () => void;
  modelOptions: import('./ModelDropdown').ModelOption[];
  selectedModel: string;
  onModelChange: (value: string) => void;
  messages: any[];
  addMessage: (msg: any) => void;
  onSend?: (text: string) => void;
  aiChat: ReturnType<typeof useAiChatStreamMutation>;
  blogTitle?: string;
}
export default function AiChatSidebar({
  onToggleMode,
  onClose,
  modelOptions,
  selectedModel,
  onModelChange,
  messages,
  addMessage,
  onSend,
  aiChat,
  blogTitle,
}: AiChatSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(384); // 기본 w-96 (384px)
  const [isResizing, setIsResizing] = useState(false);
  const [tooltipY, setTooltipY] = useState<number | null>(null);
  const lastTooltipYRef = useRef(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const onEnter = (e: React.MouseEvent) => {
    const rect = handleRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipY(e.clientY - rect.top); // 핸들 기준 Y
  };

  const onLeave = () => setTooltipY(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (tooltipY !== null) {
      lastTooltipYRef.current = tooltipY;
    }
  }, [tooltipY]);

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
          bg-white border-l border-gray-200
          flex flex-col flex-shrink-0
          sticky top-0
          max-[960px]:fixed max-[960px]:right-0 max-[960px]:inset-y-0 max-[960px]:z-50 max-[960px]:w-96
          relative
        "
    >
      {/* 리사이저 핸들 */}
      <div
        ref={handleRef}
        className="group absolute left-0 top-0 bottom-0 w-4 cursor-col-resize max-[960px]:hidden z-20"
      >
        {/* 실제 드래그/호버 영역 */}
        <div
          onMouseDown={startResizing}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="relative h-full w-full"
        >
          <Tooltip
            text="드래그해서 크기 조절"
            open={tooltipY !== null}
            position="left-center"
            style={{ top: tooltipY ?? lastTooltipYRef.current, transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      <AiChatHeader mode="sidebar" onToggleMode={onToggleMode} onClose={onClose} />

      {/* AI 채팅 컴포넌트 (내부만 스크롤) */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <AiChatBody
          modelOptions={modelOptions}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          messages={messages}
          addMessage={addMessage}
          onSend={onSend}
          aiChat={aiChat}
          blogTitle={blogTitle}
        />
      </div>
    </div>
  );
}
