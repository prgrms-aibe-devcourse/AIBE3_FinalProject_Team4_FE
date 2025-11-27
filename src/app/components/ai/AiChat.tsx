'use client';

import { useState } from 'react';
import ActionBubble from './ActionBubble';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  actions?: string[];
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'that looks so good that looks so good that looks so good that looks so good that looks so good!',
      actions: ['문제 교정', '내용 늘리기'],
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
      <div className="p-4 border-b bg-white text-lg font-semibold">텍톡 AI</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-2">
            <ChatBubble role={msg.role} text={msg.text} />
            {msg.actions && <ActionBubble actions={msg.actions} />}
          </div>
        ))}
      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
}
