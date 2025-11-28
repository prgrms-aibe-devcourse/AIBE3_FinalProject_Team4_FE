'use client';

import { useState } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { ModelOption } from './ModelDropdown';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface AIChatProps {
  modelOptions: ModelOption[];
  selectedModel: string;
  onModelChange: (value: string) => void;
}

export default function AIChat({ modelOptions, selectedModel, onModelChange }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'that looks so good that looks so good that looks so good that looks so good that looks so good!',
    },
    {
      id: 2,
      role: 'user',
      text: 'or we could make this?',
    },
    {
      id: 3,
      role: 'assistant',
      text: 'that looks so good that looks so good that looks so good that looks so good!',
    },
    {
      id: 4,
      role: 'assistant',
      text: 'that looks so good that looks so good that looks so good that looks so good!',
    },
    {
      id: 5,
      role: 'assistant',
      text: 'that looks so good that looks so good that looks so good that looks so good!',
    },
    {
      id: 6,
      role: 'assistant',
      text: 'that looks so good that looks so good that looks so good that looks so good!',
    },
    {
      id: 7,
      role: 'assistant',
      text: 'that looks so good that looks so good that looks so good that looks so good!',
    },
  ]);

  const sendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      role: 'user',
      text,
    };
    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'AI 응답 예시! 입력한 문장: ' + text,
      };
      setMessages((prev) => [...prev, reply]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
        ))}
      </div>
      {/* 입력 영역 */}
      <ChatInput
        onSend={sendMessage}
        modelOptions={modelOptions}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
    </div>
  );
}
