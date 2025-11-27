'use client';

import { ArrowRight, Plus } from 'lucide-react';
import { useState } from 'react';

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex items-center gap-3 border rounded-2xl px-4 py-3">
        {/* 첨부 버튼 */}
        <button className="text-gray-500">
          <Plus size={20} />
        </button>

        <input
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder="AI에게 작업을 맡기세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />

        <button
          onClick={submit}
          className="p-2 rounded-full bg-[#6A5A90] text-white hover:bg-[#5A4A80]"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
