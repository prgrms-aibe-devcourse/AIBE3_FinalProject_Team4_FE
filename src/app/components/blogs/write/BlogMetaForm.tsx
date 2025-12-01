'use client';

import { KeyboardEvent, useState } from 'react';
import type { BlogVisibility } from '../../../../types/blog';

type BlogMetaFormProps = {
  title: string;
  onTitleChange: (v: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  visibility: BlogVisibility;
  onVisibilityChange: (v: BlogVisibility) => void;
};

export function BlogMetaForm({
  title,
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
      <div>
        <input
          type="text"
          className="w-full border-0 bg-transparent text-xl font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      {/* 태그 + 공개범위 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* 태그 입력 */}
        <div className="flex flex-wrap items-center gap-2">
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
