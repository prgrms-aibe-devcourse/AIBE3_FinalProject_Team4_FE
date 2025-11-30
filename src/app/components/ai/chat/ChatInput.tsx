import { useAiChatStreamMutation } from '@/src/api/useAiChatStream';
import { ModelOption } from '@/src/types/ai';
import { ArrowUp, FileText, Square } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import Tooltip from '../../common/Tooltip';
import ModelDropdown from './ModelDropdown';

interface ChatInputProps {
  onSend: (message: string) => void;
  blogTitle?: string;
  modelOptions: ModelOption[];
  selectedModel: ModelOption['value'];
  onModelChange: (value: ModelOption['value']) => void;
  aiChat: ReturnType<typeof useAiChatStreamMutation>;
}

export default function ChatInput({
  onSend,
  blogTitle,
  modelOptions,
  selectedModel,
  onModelChange,
  aiChat,
}: ChatInputProps) {
  // selectedModel, modelOptions, onModelChange는 모두 상위에서 관리
  const selected = modelOptions.find((opt) => opt.value === selectedModel) || modelOptions[0];
  const handleModelSelect = (value: ModelOption['value']) => {
    onModelChange(value);
  };
  const isModelDisabled = !selected.enabled;
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isAnswering = aiChat.isStreaming;

  const submit = useCallback(() => {
    if (!message.trim()) return;
    onSend(message);
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
      {/* 모델 한도 초과 안내문구 */}
      {isModelDisabled && (
        <div className="mb-2 flex justify-center">
          <div className="px-4 py-2 rounded-md bg-slate-700 text-white text-[12.5px] font-light text-center shadow animate-fadein">
            모델 사용 한도에 도달했습니다. 다음 날 한도가 초기화될 때까지 다른 모델을 사용하세요.
          </div>
        </div>
      )}
      <div className="rounded-3xl border bg-white p-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
        {/* Top row: small badges / context */}
        <div className="inline-flex max-w-full items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-xs text-slate-700 border">
          <FileText size={14} className="text-slate-500" />
          <span className="min-w-0 truncate font-light">{displayTitle}</span>
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
            placeholder={isModelDisabled ? '모델 사용 불가' : '블로그 작성 도움받기'}
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
                  if (isAnswering) {
                    aiChat.stop();
                  } else {
                    submit();
                  }
                }
              }
            }}
          />
        </div>

        {/* Bottom row: left icons + source label, center edit checkbox, right send */}
        <div className="flex items-center justify-between gap-3">
          {/* 모델 선택 드롭다운 */}
          <ModelDropdown
            options={modelOptions}
            selected={selected}
            onSelect={handleModelSelect}
            direction="up"
          />
          {/* 전송 버튼 */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center group">
              <button
                onClick={
                  isAnswering
                    ? aiChat.stop
                    : message.trim() && !isModelDisabled
                      ? submit
                      : undefined
                }
                aria-label="전송"
                disabled={!message.trim() || isAnswering || isModelDisabled}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition
                  ${
                    isAnswering
                      ? 'bg-slate-900 text-white cursor-pointer'
                      : message.trim() && !isModelDisabled
                        ? 'bg-main text-white hover:brightness-95 cursor-pointer'
                        : 'bg-gray-200 text-gray-400'
                  }`}
              >
                {isAnswering ? <Square size={15} fill="white" /> : <ArrowUp size={18} />}
              </button>
              {/* Tooltip: 마우스 호버 시 노출 */}
              {(!message.trim() || isAnswering || isModelDisabled) && (
                <Tooltip
                  text={
                    isModelDisabled
                      ? '사용 한도 도달'
                      : isAnswering
                        ? '대답 생성 중지'
                        : !message.trim()
                          ? '내용 없음'
                          : ''
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
