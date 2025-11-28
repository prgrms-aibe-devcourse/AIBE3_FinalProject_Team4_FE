import { ArrowUp, FileText } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import ModelDropdown from './ModelDropdown';

interface ModelOption {
  label: string;
  value: string;
  enabled: boolean;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  blogTitle?: string;
  isAnswering?: boolean; // ai가 답변 중인지 여부
  modelOptions: ModelOption[];
  selectedModel: string;
  onModelChange: (value: string) => void;
}

export default function ChatInput({
  onSend,
  blogTitle,
  isAnswering,
  modelOptions,
  selectedModel,
  onModelChange,
}: ChatInputProps) {
  // selectedModel, modelOptions, onModelChange는 모두 상위에서 관리
  const selected = modelOptions.find((opt) => opt.value === selectedModel) || modelOptions[0];
  const handleModelSelect = (value: string) => {
    onModelChange(value);
  };
  const isModelDisabled = !selected.enabled;
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const submit = useCallback(() => {
    const t = message.trim();
    if (!t) return;
    onSend(t);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, onSend]);

  // blogTitle이 바뀔 때마다 자동 반영
  const displayTitle = useMemo(() => {
    if (typeof blogTitle === 'string' && blogTitle.trim() !== '') {
      return blogTitle;
    }
    return '제목 없음';
  }, [blogTitle]);

  return (
    <div className="p-4">
      <div className="rounded-3xl border bg-white p-3 shadow-sm">
        {/* Top row: small badges / context */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-xs text-slate-700 border">
          <FileText size={14} className="text-slate-500" />
          <span className="whitespace-nowrap font-light">{displayTitle}</span>
        </div>

        {/* Middle: large input / placeholder */}
        <div className="mb-3 mt-3">
          <label htmlFor="ai-input" className="sr-only">
            message
          </label>
          <textarea
            id="ai-input"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={1}
            placeholder={isModelDisabled ? '이 모델은 사용할 수 없습니다' : '블로그 작성 도움받기'}
            className="w-full min-h-[40px] max-h-[240px] resize-none bg-transparent outline-none text-[15px] placeholder:text-slate-400 placeholder:text-[15px] placeholder:font-extralight font-light leading-relaxed overflow-y-auto"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 240) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isModelDisabled) {
                  submit();
                }
              }
            }}
          />
        </div>

        {/* Bottom row: left icons + source label, center edit checkbox, right send */}
        <div className="flex items-center justify-between gap-3">
          <ModelDropdown
            options={modelOptions}
            selected={selected}
            onSelect={handleModelSelect}
            direction="up"
          />

          <div className="flex items-center gap-4">
            <button
              onClick={message.trim() && !isAnswering && !isModelDisabled ? submit : undefined}
              aria-label="전송"
              disabled={!message.trim() || isAnswering || isModelDisabled}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition
                ${message.trim() && !isAnswering && !isModelDisabled ? 'bg-main text-white hover:brightness-95 cursor-pointer' : 'bg-gray-200 text-gray-400'}`}
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
