'use client';

import { KeyboardEvent, useState } from 'react';
import type { BlogVisibility } from '../../../../types/blog';
import AiGeneration from '../../ai/generate/AiGeneration';

type BlogMetaFormProps = {
  title: string;
  content: string;
  onTitleChange: (v: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  visibility: BlogVisibility;
  onVisibilityChange: (v: BlogVisibility) => void;
};

export function BlogMetaForm({
  title,
  content,
  onTitleChange,
  tags,
  onTagsChange,
  visibility,
  onVisibilityChange,
}: BlogMetaFormProps) {
  const [tagInput, setTagInput] = useState('');

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (!trimmed) return;
      if (!tags.includes(trimmed)) {
        onTagsChange([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div className="group/ai relative flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border-0 bg-transparent text-xl font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        <div className="absolute z-10 right-0 top-1/2 -translate-y-1/2">
          <AiGeneration
            mode="title"
            contentType="blog"
            content={content}
            onApply={onTitleChange}
            revealOnHover={false}
          />
        </div>
      </div>

      {/* 태그 + 공개범위 */}
      <div className="relative w-full pr-10">
        {/* 태그 입력 */}
        <div className="group/ai flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600"
            >
              #{tag}
              <span className="text-slate-400">×</span>
            </button>
          ))}
          <input
            type="text"
            className="min-w-[120px] border-0 bg-transparent text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0"
            placeholder="태그 추가 (Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <AiGeneration
              mode="hashtag"
              contentType="blog"
              content={content}
              onApply={(tag) => {
                const trimmed = tag.trim();
                if (trimmed && !tags.includes(trimmed)) {
                  onTagsChange([...tags, trimmed]);
                }
              }}
              revealOnHover
            />
          </div>
        </div>

        {/* 공개 범위
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="text-slate-400">공개 범위</span>
          <button
            type="button"
            onClick={() => onVisibilityChange('PUBLIC')}
            className={`rounded-full px-3 py-1 ${
              visibility === 'PUBLIC'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-50 text-slate-500'
            }`}
          >
            전체 공개
          </button>
          <button
            type="button"
            onClick={() => onVisibilityChange('PRIVATE')}
            className={`rounded-full px-3 py-1 ${
              visibility === 'PRIVATE' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'
            }`}
          >
            비공개
          </button> */}
        {/* </div> */}
      </div>
    </div>
  );
}
