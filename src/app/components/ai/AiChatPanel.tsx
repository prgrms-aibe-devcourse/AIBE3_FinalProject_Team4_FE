'use client';
import { useState } from 'react';
import ChatBotButton from './AiChatBotButton';
import AIChat from './chat/AiChatBody';
import AiChatHeader from './chat/AiChatHeader';
type DisplayMode = 'sidebar' | 'floating';

export default function AiChatSideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DisplayMode>('sidebar');

  const toggleMode = () => {
    setMode((prev) => (prev === 'sidebar' ? 'floating' : 'sidebar'));
  };

  return (
    <>
      {/* 열기 버튼 */}
      {!isOpen && (
        <ChatBotButton
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50"
          ariaLabel="AI 채팅 열기"
        />
      )}

      {/* 사이드바 모드 */}
      {isOpen && mode === 'sidebar' && (
        <div
          className="
            h-dvh w-96
            bg-white shadow-2xl border-l border-gray-200
            flex flex-col flex-shrink-0
            max-[960px]:fixed max-[960px]:top-0 max-[960px]:right-0 max-[960px]:z-50
          "
        >
          <AiChatHeader mode={mode} onToggleMode={toggleMode} onClose={() => setIsOpen(false)} />

          {/* AI 채팅 컴포넌트 (내부만 스크롤) */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <AIChat />
          </div>
        </div>
      )}

      {/* 플로팅 모드 */}
      {isOpen && mode === 'floating' && (
        <div
          className="
            fixed bottom-6 right-6
            w-[min(24rem,100vw-3rem)]  /* 작은 화면 대응 */
            h-[min(600px,100dvh-3rem)]
            bg-white shadow-2xl rounded-lg border border-gray-200
            z-50 flex flex-col
          "
        >
          <AiChatHeader mode={mode} onToggleMode={toggleMode} onClose={() => setIsOpen(false)} />

          {/* AI 채팅 컴포넌트 (내부만 스크롤) */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <AIChat />
          </div>
        </div>
      )}
    </>
  );
}
