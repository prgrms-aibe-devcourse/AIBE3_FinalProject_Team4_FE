'use client';

import ReactMarkdown from 'react-markdown';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { ModelOption } from './ModelDropdown';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface AIChatBodyProps {
  modelOptions: ModelOption[];
  selectedModel: string;
  onModelChange: (value: string) => void;
  messages: Message[];
  addMessage: (msg: Message) => void;
}

export default function AIChatBody({
  modelOptions,
  selectedModel,
  onModelChange,
  messages,
  addMessage,
}: AIChatBodyProps) {
  // user 메시지와 ai 응답 메시지 분리
  const userMessages = messages.filter((msg) => msg.role === 'user');
  const aiMessages = messages.filter((msg) => msg.role === 'assistant');

  // 가장 최근 ai 응답만 표시 (여러 개면 마지막 것)
  const latestAi = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null;

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 영역 (user) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {userMessages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
        ))}
        {/* AI 응답은 버블이 아니라 별도 markdown 영역에 */}
        {latestAi && (
          <div className="mt-4 p-4 bg-gray-50 border rounded-xl text-[15px] prose max-w-none">
            <ReactMarkdown>{latestAi.text}</ReactMarkdown>
          </div>
        )}
      </div>
      {/* 입력 영역 */}
      <ChatInput
        onSend={(text) => {
          addMessage({ id: Date.now(), role: 'user', text });
          // 실제 ai 응답은 상위에서 처리 필요 (여기선 예시)
        }}
        modelOptions={modelOptions}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
    </div>
  );
}
