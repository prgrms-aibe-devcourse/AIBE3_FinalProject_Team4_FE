'use client';

import { useAiChatStreamMutation } from '@/src/api/useAiChatStream';
import { ChatMessage as Message, ModelOption } from '@/src/types/ai';
import ReactMarkdown from 'react-markdown';
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
        onSend={onSend}
        modelOptions={modelOptions}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        aiChat={aiChat}
        blogTitle={blogTitle}
      />
    </div>
  );
}
