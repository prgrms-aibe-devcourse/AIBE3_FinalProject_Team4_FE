'use client';

import { useAiChatStreamMutation } from '@/src/api/useAiChatStream';
import { ChatMessage as Message, ModelOption } from '@/src/types/ai';

import { useEffect, useRef, useState } from 'react';
import { MarkdownViewer } from '../../blogs/write/MarkdownViewer';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

interface AIChatBodyProps {
  modelOptions: ModelOption[];
  selectedModel: ModelOption['value'];
  onModelChange: (value: ModelOption['value']) => void;
  messages: Message[];
  addMessage: (msg: Message) => void;
  onSend: (text: string) => void;
  aiChat: ReturnType<typeof useAiChatStreamMutation>;
  blogTitle?: string;
}
export default function AIChatBody({
  modelOptions,
  selectedModel,
  onModelChange,
  messages,
  addMessage,
  onSend,
  aiChat,
  blogTitle,
}: AIChatBodyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // 스크롤을 맨 아래로 내리는 함수
  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  // 메시지가 바뀌거나 처음 열릴 때 스크롤 아래로
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 스크롤 위치 감지해서 버튼 표시
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // 40px 이상 위로 올라가면 버튼 표시
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 40);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* 메시지 영역 (user) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6" onScroll={handleScroll}>
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
          ) : (
            <ChatBubble key={msg.id} role={msg.role}>
              <MarkdownViewer markdown={msg.text} />
            </ChatBubble>
          ),
        )}
      </div>
      {/* 입력 영역 */}
      <ChatInput
        onSend={onSend}
        modelOptions={modelOptions}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        aiChat={aiChat}
        blogTitle={blogTitle}
        showScrollBtn={showScrollBtn}
        onScrollDown={scrollToBottom}
      />
    </div>
  );
}
