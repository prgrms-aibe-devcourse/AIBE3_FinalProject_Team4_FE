'use client';
import { useAiChatStreamMutation } from '@/src/api/useAiChatStream';
import Tooltip from '@/src/app/components/ai/Tooltip';
import AiChatBody from '@/src/app/components/ai/chat/AiChatBody';
import AiChatHeader from '@/src/app/components/ai/chat/AiChatHeader';
import { ModelOption } from '@/src/types/ai';
import { useEffect, useRef, useState } from 'react';

interface AiChatSidebarProps {
  onToggleMode: () => void;
  onClose: () => void;
  modelOptions: ModelOption[];
  selectedModel: ModelOption['value'];
  onModelChange: (value: ModelOption['value']) => void;
  messages: any[];
  addMessage: (msg: any) => void;
  onSend: (text: string) => void;
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
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const [isResizing, setIsResizing] = useState(false);

  // overlay
  const [overlay, setOverlay] = useState(false);

  // tooltip
  const [tooltipY, setTooltipY] = useState<number | null>(null);
  const lastTooltipYRef = useRef(0);
  const handleRef = useRef<HTMLDivElement>(null);

  /** === 전환 로직 === */
  const THRESHOLD = 560; // or 420
  const HYSTERESIS = 32; // or 24
  const RESERVED_MAX = THRESHOLD;
  const MOBILE_BREAKPOINT = 960;

  // overlay=false 일 때만 본문 밀어내기
  const reservedWidth = !overlay ? Math.min(sidebarWidth, RESERVED_MAX) : 0;

  /** overlay 판단 */
  useEffect(() => {
    const decideOverlay = () => {
      const isSmallScreen = window.innerWidth <= MOBILE_BREAKPOINT;
      if (isSmallScreen) {
        setOverlay(true);
        return;
      }

      setOverlay((prev) => {
        if (!prev && sidebarWidth > THRESHOLD) return true;
        if (prev && sidebarWidth < THRESHOLD - HYSTERESIS) return false;
        return prev;
      });
    };

    decideOverlay();
    window.addEventListener('resize', decideOverlay);
    return () => window.removeEventListener('resize', decideOverlay);
  }, [sidebarWidth]);

  /** 브라우저 창 줄어들면 사이드바 너비도 자동 축소 */
  useEffect(() => {
    const clampWidthOnResize = () => {
      const maxWidth = Math.min(800, window.innerWidth - 80);
      const clamped = Math.max(300, Math.min(sidebarWidth, maxWidth));
      if (clamped !== sidebarWidth) setSidebarWidth(clamped);
    };

    clampWidthOnResize(); // 마운트 시 1번 보정
    window.addEventListener('resize', clampWidthOnResize);
    return () => window.removeEventListener('resize', clampWidthOnResize);
  }, [sidebarWidth]);

  /** body paddingRight로 본문 밀어내기 */
  useEffect(() => {
    const body = document.body;
    const prevPaddingRight = body.style.paddingRight;

    body.style.paddingRight = reservedWidth ? `${reservedWidth}px` : '0px';

    return () => {
      body.style.paddingRight = prevPaddingRight;
    };
  }, [reservedWidth]);

  /** 리사이즈 드래그 */
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.min(800, window.innerWidth - 80);
      const clamped = Math.max(300, Math.min(newWidth, maxWidth));
      setSidebarWidth(clamped);
    };
    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  /** tooltip 위치 */
  const onEnter = (e: React.MouseEvent) => {
    const rect = handleRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipY(e.clientY - rect.top);
  };
  const onLeave = () => setTooltipY(null);
  useEffect(() => {
    if (tooltipY !== null) lastTooltipYRef.current = tooltipY;
  }, [tooltipY]);

  return (
    <div
      style={{ width: `${sidebarWidth}px` }}
      className={[
        'bg-white border-l border-gray-200 flex flex-col',
        'top-0 right-0 h-dvh',
        // push 모드여도 fixed 유지 (스크롤 문제 해결)
        'fixed z-30',
      ].join(' ')}
    >
      {/* 리사이저 핸들 */}
      <div
        ref={handleRef}
        className="group absolute left-0 top-0 bottom-0 w-4 cursor-col-resize max-[960px]:hidden z-30"
      >
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
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
