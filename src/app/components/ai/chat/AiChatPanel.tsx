'use client';
import { useAiChatStreamMutation } from '@/src/api/useAiChatStream';
import { useState } from 'react';
import Tooltip from '../../common/Tooltip';
import AIChatBody from './AiChatBody';
import AiChatHeader from './AiChatHeader';
import AiChatSidebar from './AiChatSidebar';
import ChatBotButton from './ChatBotButton';
import { ModelOption } from './ModelDropdown';
type DisplayMode = 'sidebar' | 'floating';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}
export default function AiChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DisplayMode>('sidebar');

  // 채팅 메시지 상태 (user/ai 모두)
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 모델 옵션/선택값/변경함수 상태를 여기서 관리
  const modelOptions: ModelOption[] = [
    { label: 'GPT-4o-mini', value: 'gpt-4o-mini', enabled: true },
    { label: '추가 예정', value: '추가 예정', enabled: true },
    { label: '추가 예정2', value: '추가 예정2', enabled: false },
  ];
  const [selectedModel, setSelectedModel] = useState<string>(modelOptions[0].value);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'sidebar' ? 'floating' : 'sidebar'));
  };

  // 메시지 추가 함수 (user/ai 모두)
  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const aiChat = useAiChatStreamMutation({
    onChunk: (chunk) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];

        if (last?.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, text: last.text + chunk }];
        }
        return [...prev, { id: Date.now(), role: 'assistant', text: chunk }];
      });
    },
    onError: (e) => {
      console.error(e);
      // 필요하면 마지막 assistant 메시지에 에러 표시
    },
  });

  const handleSend = (text: string) => {
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text }]);

    aiChat.start({
      id: 'temp',
      message: text,
      content: text,
      model: selectedModel,
    });
  };

  return (
    <>
      {/* 열기 버튼 */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <ChatBotButton onClick={() => setIsOpen(true)} ariaLabel="AI 채팅 열기" />
          <Tooltip
            text="안녕하세요. TexTok 블로그 작성 도우미입니다."
            className="bg-white text-[15px] text-gray-700 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)] rounded-[10px] px-2.5 py-1.5"
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
          messages={messages}
          addMessage={addMessage}
          onSend={handleSend}
          aiChat={aiChat}
        />
      )}

      {/* 플로팅 모드 */}
      {isOpen && mode === 'floating' && (
        <div
          className="
            fixed bottom-6 right-6
            w-[min(28rem,100vw-3rem)]  /* 작은 화면 대응 */
            h-[min(600px,100dvh-3rem)]
            bg-white rounded-t-[20px] rounded-b-[40px] border border-gray-200
            shadow-[0_4px_12px_0_rgba(0,0,0,0.06),0_1.5px_4px_0_rgba(0,0,0,0.03)]
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
              messages={messages}
              addMessage={addMessage}
              onSend={handleSend}
              aiChat={aiChat}
            />
          </div>
        </div>
      )}
    </>
  );
}
