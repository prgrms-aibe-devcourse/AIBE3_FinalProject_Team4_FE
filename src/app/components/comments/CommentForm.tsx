'use client';

import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (!text.trim()) return alert('내용을 입력해주세요.');

    await onSubmit(text);
    setText('');
  };

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        className="flex-1 border rounded px-2 py-1 text-sm"
        placeholder="댓글을 입력하세요..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleSubmit} className="text-sm font-semibold text-blue-600">
        등록
      </button>
    </div>
  );
}
