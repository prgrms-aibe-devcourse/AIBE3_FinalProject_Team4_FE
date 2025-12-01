'use client';
import { createContext, useContext, useState } from 'react';

const ChatPanelSlotContext = createContext<{
  setChatPanel: (node: React.ReactNode) => void;
} | null>(null);

export function SlotProvider({ children }: { children: React.ReactNode }) {
  const [chatPanel, setChatPanel] = useState<React.ReactNode>(null);

  return (
    <ChatPanelSlotContext.Provider value={{ setChatPanel }}>
      <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10">{children}</div>
        </main>
        {/* AI 채팅 패널은 layout 바깥 칼럼에 렌더 */}
        {chatPanel}
      </div>
    </ChatPanelSlotContext.Provider>
  );
}

export function useChatPanelSlot() {
  const ctx = useContext(ChatPanelSlotContext);
  if (!ctx) throw new Error('useChatPanelSlot must be used within provider');
  return ctx;
}
