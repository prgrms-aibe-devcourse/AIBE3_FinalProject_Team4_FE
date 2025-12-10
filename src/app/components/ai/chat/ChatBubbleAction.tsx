import Tooltip from '@/src/app/components/ai/Tooltip';
import { Check, Copy } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

export interface ChatBubbleActionProps {
  text: string;
  index: number;
  copiedIndex: number | null;
  setCopiedIndex: Dispatch<SetStateAction<number | null>>;
  align: 'left' | 'right';
  alwaysShow?: boolean;
}

export default function ChatBubbleAction({
  text,
  index,
  copiedIndex,
  setCopiedIndex,
  align,
  alwaysShow,
}: ChatBubbleActionProps) {
  const positionClass = align === 'right' ? 'justify-end' : 'justify-start';
  const copied = copiedIndex === index;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch {
      // 실패 시 무시
    }
  };

  return (
    <div className={`flex w-full ${positionClass} pt-2 min-h-[32px]`}>
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          className={`
            peer
            w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-500
            transition pointer-events-auto
            hover:bg-slate-200 hover:text-slate-700
            ${alwaysShow ? '' : 'opacity-0 group-hover:opacity-100'}
          `}
          aria-label="복사"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <Tooltip side="bottom" hover="peer" text={copied ? '복사됨' : '복사'} />
      </div>
    </div>
  );
}
