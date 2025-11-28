'use client';
import { useState } from 'react';
import AIChatBody from './AiChatBody';
import ChatBotButton from './AiChatBotButton';
import AiChatHeader from './AiChatHeader';
import AiChatSidebar from './AiChatSidebar';
import { ModelOption } from './ModelDropdown';
import Tooltip from './Tooltip';
type DisplayMode = 'sidebar' | 'floating';

export default function AiChatSideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DisplayMode>('sidebar');

  // 모델 옵션/선택값/변경함수 상태를 여기서 관리
  const modelOptions: ModelOption[] = [
    { label: 'GPT-4o-mini', value: 'gpt-4o-mini', enabled: false },
    { label: '추가 예정', value: '추가 예정', enabled: false },
    { label: '추가 예정2', value: '추가 예정2', enabled: false },
  ];
  const [selectedModel, setSelectedModel] = useState<string>(modelOptions[0].value);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'sidebar' ? 'floating' : 'sidebar'));
  };

  return (
    <>
      {/* 열기 버튼 */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <ChatBotButton onClick={() => setIsOpen(true)} ariaLabel="AI 채팅 열기" />
          <Tooltip
            text="안녕하세요. 블로그 작성 도우미입니다."
            className="bg-white text-[15px] text-gray-700 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)] rounded-[10px] px-3 py-2"
            animationClass="translate-x-1 group-hover:translate-x-0 origin-right"
            position="top-right"
          />
        </div>
      )}

      {/* 사이드바 모드 */}
      {isOpen && mode === 'sidebar' && (
        <AiChatSidebar
          onToggleMode={toggleMode}
          onClose={() => setIsOpen(false)}
          modelOptions={modelOptions}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />
      )}

      {/* 플로팅 모드 */}
      {isOpen && mode === 'floating' && (
        <div
          className="
            fixed bottom-6 right-6
            w-[min(28rem,100vw-3rem)]  /* 작은 화면 대응 */
            h-[min(600px,100dvh-3rem)]
            bg-white shadow-lg rounded-3xl border border-gray-200
            z-50 flex flex-col
          "
        >
          <AiChatHeader mode={mode} onToggleMode={toggleMode} onClose={() => setIsOpen(false)} />

          {/* AI 채팅 컴포넌트 (내부만 스크롤) */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <AIChatBody
              modelOptions={modelOptions}
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
            />
          </div>
        </div>
      )}
    </>
  );
}
