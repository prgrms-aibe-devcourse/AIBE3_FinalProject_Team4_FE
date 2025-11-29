'use client';

import { useAiChatStreamMutation } from '@/src/api/useAiChatStream';
import ReactMarkdown from 'react-markdown';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { ModelOption } from './ModelDropdown';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

interface AIChatBodyProps {
  modelOptions: ModelOption[];
  selectedModel: string;
  onModelChange: (value: string) => void;
  messages: Message[];
  addMessage: (msg: Message) => void;
  onSend?: (text: string) => void;
  aiChat: ReturnType<typeof useAiChatStreamMutation>;
}
export default function AIChatBody({
  modelOptions,
  selectedModel,
  onModelChange,
  messages,
  addMessage,
  onSend,
  aiChat,
}: AIChatBodyProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 메시지 영역 (user) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
          ) : (
            <ChatBubble key={msg.id} role={msg.role}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </ChatBubble>
          ),
        )}
      </div>
      {/* 입력 영역 */}
      <ChatInput
        onSend={
          onSend
            ? onSend
            : (text) => {
                addMessage({ id: Date.now(), role: 'user', text });
              }
        }
        modelOptions={modelOptions}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        aiChat={aiChat}
      />
    </div>
  );
}
