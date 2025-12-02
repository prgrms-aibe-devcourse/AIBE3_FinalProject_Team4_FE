'use client';

import AiGeneration from '@/src/app/components/ai/generate/AiGeneration';

import { useState } from 'react';

export default function AIDemoPage() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const content =
    "나는 오늘 나비를 잡았다. 겨울에 웬 나비냐고? 바로 '겨울나비'다. 겨울나비는 추운 겨울에도 활동하는 몇 안 되는 나비 종류 중 하나로, 그 아름다운 날개는 마치 얼음 결정처럼 반짝인다.";

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
      }}
    >
      {/* 제목 입력 및 AI 버튼 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          style={{
            fontSize: 20,
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ddd',
            width: 320,
            marginBottom: 8,
          }}
        />
        <AiGeneration
          contentType="blog"
          content={content}
          mode="title"
          onApply={(value) => setTitle(value)}
        />
      </div>

      {/* 요약 입력 및 AI 버튼 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="요약을 입력하세요"
          style={{
            fontSize: 18,
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ddd',
            width: 320,
            minHeight: 60,
            marginBottom: 8,
            resize: 'vertical',
          }}
        />
        <AiGeneration
          contentType="blog"
          content={content}
          mode="summary"
          onApply={(value) => setSummary(value)}
        />
      </div>
    </div>
  );
}
