'use client';

import {
  Bold,
  Code,
  Eye,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onUploadImage?: (file: File) => Promise<string>;
};

type Mode = 'write' | 'preview';

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  onUploadImage,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<Mode>('write');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openImageFilePicker = () => {
    if (!onUploadImage) {
      alert('이미지 업로드 기능이 아직 연결되지 않았습니다.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!onUploadImage) return;

    try {
      setIsUploadingImage(true);
      const url = await onUploadImage(file);

      const next = (value ? value.replace(/\s+$/, '') + '\n\n' : '') + `![이미지 설명](${url})\n`;
      onChange(next);
      // setMode('preview');
    } catch (err) {
      console.error(err);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 마크다운 기본 동작
  const applyWrap = (prefix: string, suffix: string = prefix) => {
    if (!value) return onChange(`${prefix}텍스트${suffix}`);
    onChange(`${prefix}${value}${suffix}`);
  };

  const insertAtTop = (text: string) => {
    if (!value) return onChange(text);
    onChange(`${text}\n${value}`);
  };

  const toolbar = (
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex flex-wrap items-center gap-1">
        <ToolbarButton icon={<Bold size={14} />} label="굵게" onClick={() => applyWrap('**')} />
        <ToolbarButton icon={<Italic size={14} />} label="이탤릭" onClick={() => applyWrap('_')} />
        <ToolbarButton icon={<Code size={14} />} label="코드" onClick={() => applyWrap('`')} />
        <ToolbarButton
          icon={<List size={14} />}
          label="리스트"
          onClick={() => insertAtTop('- 항목1\n- 항목2')}
        />
        <ToolbarButton
          icon={<Quote size={14} />}
          label="인용"
          onClick={() => insertAtTop('> 인용문')}
        />
        <ToolbarButton
          icon={<LinkIcon size={14} />}
          label="링크"
          onClick={() =>
            onChange(value + (value ? '\n' : '') + '[링크텍스트](https://example.com)')
          }
        />
        <ToolbarButton
          icon={<ImageIcon size={14} />}
          label={isUploadingImage ? '이미지 업로드 중...' : '이미지'}
          disabled={isUploadingImage}
          onClick={openImageFilePicker}
        />
      </div>

      <div className="flex items-center gap-1 rounded-full bg-slate-100 p-0.5 text-[11px]">
        <button
          type="button"
          onClick={() => setMode('write')}
          className={`rounded-full px-2 py-1 ${
            mode === 'write' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          작성
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={`flex items-center gap-1 rounded-full px-2 py-1 ${
            mode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          <Eye size={12} />
          미리보기
        </button>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {toolbar}

      {mode === 'write' ? (
        <textarea
          className="h-[260px] w-full resize-none border-0 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:outline-none focus:ring-0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '마크다운 형식으로 내용을 작성해 주세요.'}
        />
      ) : (
        <div className="prose prose-sm max-w-none px-3 py-2 text-sm text-slate-800 prose-headings:mt-3 prose-headings:mb-1">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-xs text-slate-400">미리볼 내용이 없습니다.</p>
          )}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-400">
        <span>Markdown 지원</span>
        <span>{value.trim().length}자</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
    </div>
  );
}

type ToolbarButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

function ToolbarButton({ icon, label, onClick, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
        disabled ? 'cursor-not-allowed text-slate-300' : 'text-slate-600 hover:bg-slate-100'
      }`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
