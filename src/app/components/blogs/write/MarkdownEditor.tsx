'use client';

import {
  Bold,
  CheckSquare2Icon,
  Code2Icon as Code,
  Eye,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const updateSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    selectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  }, []);
  // ---------------------------
  // 1) 선택 영역 기반 wrap (굵게/기울임/인라인 코드 등)
  // ---------------------------
  const applyWrap = (prefix: string, suffix: string = prefix) => {
    const { start, end } = selectionRef.current;
    const textarea = textareaRef.current;

    // value가 비어 있으면 그냥 끝에 추가
    if (!textarea) {
      const selected = value || '텍스트';
      onChange(`${prefix}${selected}${suffix}`);
      return;
    }

    const safeStart = Math.max(0, Math.min(start, value.length));
    const safeEnd = Math.max(safeStart, Math.min(end, value.length));

    const before = value.slice(0, safeStart);
    const selected = value.slice(safeStart, safeEnd) || '텍스트';
    const after = value.slice(safeEnd);

    const next = `${before}${prefix}${selected}${suffix}${after}`;
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        safeStart + prefix.length,
        safeStart + prefix.length + selected.length,
      );
      selectionRef.current = {
        start: safeStart + prefix.length,
        end: safeStart + prefix.length + selected.length,
      };
    });
  };

  // ---------------------------
  // 2) 블록 삽입 (리스트/인용/체크박스 등)
  // ---------------------------
  const insertBlock = (block: string) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      onChange(value ? `${value}\n${block}` : block);
      return;
    }

    const { start } = selectionRef.current;
    const pos = Math.max(0, Math.min(start, value.length));

    const before = value.slice(0, pos);
    const after = value.slice(pos);

    const needsBefore = before && !before.endsWith('\n') ? '\n' : '';
    const needsAfter = after && !after.startsWith('\n') ? '\n' : '';

    const next = `${before}${needsBefore}${block}${needsAfter}${after}`;
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
    });
  };

  // ---------------------------
  // 3) 헤더 적용 (현재 라인에 # / ##)
  // ---------------------------
  const applyHeading = (level: 1 | 2) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const { start } = selectionRef.current;
    const pos = Math.max(0, Math.min(start, value.length));

    const lineStart = value.lastIndexOf('\n', pos - 1) + 1; // 없으면 -1 + 1 = 0
    const nextNewlineIndex = value.indexOf('\n', lineStart);
    const lineEnd = nextNewlineIndex === -1 ? value.length : nextNewlineIndex;

    const beforeLine = value.slice(0, lineStart);
    const line = value.slice(lineStart, lineEnd);
    const afterLine = value.slice(lineEnd);

    // 기존 헤더 기호 제거
    const cleanLine = line.replace(/^#{1,6}\s*/, '');
    const hashes = level === 1 ? '# ' : '## ';
    const newLine = hashes + (cleanLine || '제목');

    const next = `${beforeLine}${newLine}${afterLine}`;
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const caret = lineStart + hashes.length;
      textarea.setSelectionRange(caret, caret + (cleanLine || '제목').length);
      selectionRef.current = {
        start: caret,
        end: caret + (cleanLine || '제목').length,
      };
    });
  };

  // ---------------------------
  // 4) 코드 버튼: 한 줄이면 인라인, 여러 줄이면 코드 블록
  // ---------------------------
  const applyCode = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      // fallback
      onChange((value ? value + '\n\n' : '') + '```ts\n코드 작성\n```');
      return;
    }

    const { start, end } = selectionRef.current;
    const safeStart = Math.max(0, Math.min(start, value.length));
    const safeEnd = Math.max(safeStart, Math.min(end, value.length));

    const before = value.slice(0, safeStart);
    const selected = value.slice(safeStart, safeEnd);
    const after = value.slice(safeEnd);

    const target = selected || '코드 작성';

    // 여러 줄 → fenced code block
    if (target.includes('\n')) {
      const needsBefore = before && !before.endsWith('\n\n') ? '\n\n' : '';
      const needsAfter = after && !after.startsWith('\n\n') ? '\n\n' : '';

      const block = `${needsBefore}\`\`\`ts\n${target}\n\`\`\`${needsAfter}`;
      const next = `${before}${block}${after}`;
      onChange(next);

      requestAnimationFrame(() => {
        textarea.focus();
      });
    } else {
      // 한 줄 → 인라인 코드
      const inline = `\`${target}\``;
      const next = `${before}${inline}${after}`;
      onChange(next);

      requestAnimationFrame(() => {
        textarea.focus();
        const caretStart = safeStart + 1;
        textarea.setSelectionRange(caretStart, caretStart + target.length);
        selectionRef.current = {
          start: caretStart,
          end: caretStart + target.length,
        };
      });
    }
  };

  // ---------------------------
  // 5) 링크 삽입
  // ---------------------------
  const insertLink = () => {
    const textarea = textareaRef.current;

    if (!textarea) {
      onChange(value + (value ? '\n' : '') + '[링크텍스트](https://example.com)');
      return;
    }

    const { start, end } = selectionRef.current;
    const safeStart = Math.max(0, Math.min(start, value.length));
    const safeEnd = Math.max(safeStart, Math.min(end, value.length));

    const before = value.slice(0, safeStart);
    const selected = value.slice(safeStart, safeEnd) || '링크텍스트';
    const after = value.slice(safeEnd);

    const md = `[${selected}](https://example.com)`;
    const next = `${before}${md}${after}`;
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const labelStart = before.length + 1;
      const labelEnd = labelStart + selected.length;
      textarea.setSelectionRange(labelStart, labelEnd);
      selectionRef.current = {
        start: labelStart,
        end: labelEnd,
      };
    });
  };
  // ---------------------------
  // 4) 이미지 업로드
  // ---------------------------
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

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
  // ---------------------------
  // 7) TOOLBAR 버튼 공통
  // ---------------------------
  const ToolbarButton = ({
    icon,
    label,
    onClick,
    disabled,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      disabled={disabled}
      title={label}
      className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
      onMouseDown={(e) => {
        // textarea selection 유지하려고 focus 변동 막음
        e.preventDefault();
        onClick();
      }}
    >
      {icon}
    </button>
  );

  // ---------------------------
  // 8) PREVIEW 렌더링 스타일
  // ---------------------------
 const markdownComponents = {
   // <p> 안에 <pre> 들어가는 문제 방지 + 기본 문단 스타일
   p: ({ children }: any) => {
     const hasPre = React.Children.toArray(children).some((child: any) => child?.type === 'pre');

     if (hasPre) {
       return <div className="my-2 leading-relaxed text-slate-800">{children}</div>;
     }

     return <p className="my-2 leading-relaxed text-slate-800">{children}</p>;
   },

   // 헤딩 1
   h1: ({ children }: any) => (
     <h1 className="mt-4 mb-2 text-xl font-bold text-slate-900">{children}</h1>
   ),

   // 헤딩 2
   h2: ({ children }: any) => (
     <h2 className="mt-3 mb-1 text-lg font-semibold text-slate-900">{children}</h2>
   ),

   strong: ({ children }: any) => (
     <strong className="font-semibold text-slate-900">{children}</strong>
   ),

   em: ({ children }: any) => <em className="italic text-slate-700">{children}</em>,

   // 코드: 인라인 / 블록
   code: ({ inline, children, ...props }: any) => {
     if (inline) {
       return (
         <code
           className="rounded bg-slate-100 px-1 py-0.5 text-[12px] font-mono text-slate-800"
           {...props}
         >
           {children}
         </code>
       );
     }

     return (
       <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[12px] text-slate-50">
         <code className="font-mono" {...props}>
           {children}
         </code>
       </pre>
     );
   },

   blockquote: ({ children }: any) => (
     <blockquote className="mt-2 border-l-4 border-slate-300 pl-3 text-[13px] italic text-slate-600">
       {children}
     </blockquote>
   ),

   a: ({ href, children }: any) => (
     <a
       href={href}
       target="_blank"
       rel="noreferrer"
       className="text-sky-600 underline underline-offset-2 hover:text-sky-700"
     >
       {children}
     </a>
   ),

   // UL: 기본 리스트 스타일
   ul: ({ children, ...props }: any) => (
     <ul className="mt-2 space-y-1 pl-5 text-[13px] text-slate-800" {...props}>
       {children}
     </ul>
   ),

   // OL: 번호 리스트
   ol: ({ children, ...props }: any) => (
     <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] text-slate-800" {...props}>
       {children}
     </ol>
   ),

   // LI: 일반/체크박스 리스트 구분
   li: ({ children, checked, ...props }: any) => {
     const isTask = typeof checked === 'boolean';

     if (isTask) {
       // - [ ] 형태: 불릿 제거 + 체크박스 스타일
       return (
         <li
           style={{ listStyleType: 'none' }}
           className="flex items-start gap-2 text-[13px] text-slate-800"
           {...props}
         >
           {children}
         </li>
       );
     }

     // 일반 리스트
     return (
       <li className="list-disc leading-relaxed" {...props}>
         {children}
       </li>
     );
   },
 };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            icon={<Heading1 size={14} />}
            label="제목 1"
            onClick={() => applyHeading(1)}
          />
          <ToolbarButton
            icon={<Heading2 size={14} />}
            label="제목 2"
            onClick={() => applyHeading(2)}
          />
          <ToolbarButton icon={<Bold size={14} />} label="굵게" onClick={() => applyWrap('**')} />
          <ToolbarButton
            icon={<Italic size={14} />}
            label="이탤릭"
            onClick={() => applyWrap('_')}
          />
          <ToolbarButton icon={<Code size={14} />} label="코드" onClick={applyCode} />
          <ToolbarButton
            icon={<List size={14} />}
            label="리스트"
            onClick={() => insertBlock('- 항목 1\n- 항목 2')}
          />
          <ToolbarButton
            icon={<CheckSquare2Icon size={14} />}
            label="체크 리스트"
            onClick={() => insertBlock('- [ ] 할 일 1\n- [ ] 할 일 2')}
          />
          <ToolbarButton
            icon={<Quote size={14} />}
            label="인용"
            onClick={() => insertBlock('> 인용문')}
          />
          <ToolbarButton icon={<LinkIcon size={14} />} label="링크" onClick={insertLink} />
          <ToolbarButton
            icon={<ImageIcon size={14} />}
            label="이미지"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
          />
        </div>

        {/* MODE SELECTOR */}
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

      {/* WRITE / PREVIEW */}
      {mode === 'write' ? (
        <textarea
          ref={textareaRef}
          className="h-[260px] w-full resize-none bg-white px-3 py-2 text-sm text-slate-800 outline-none"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            // 입력 중에 selection 갱신
            requestAnimationFrame(updateSelection);
          }}
          onClick={updateSelection}
          onKeyUp={updateSelection}
          onSelect={updateSelection}
          placeholder={placeholder ?? '마크다운 형식으로 내용을 작성해 주세요.'}
        />
      ) : (
        <div className="prose prose-sm max-w-none px-3 py-2 text-sm text-slate-800">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-xs text-slate-400">미리볼 내용이 없습니다.</p>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-1.5 text-[11px] text-slate-400">
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
