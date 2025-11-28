import { Minus, PanelRight, SquareSquare } from 'lucide-react';
import Tooltip from './Tooltip';

interface AiChatHeaderProps {
  mode: 'sidebar' | 'floating';
  onToggleMode: () => void;
  onClose: () => void;
}

export default function AiChatHeader({ mode, onToggleMode, onClose }: AiChatHeaderProps) {
  return (
    <div className="flex items-center justify-between py-2 px-4 rounded-t-lg min-w-0 w-full">
      <div className="text-s text-slate-700">TexTok AI</div>
      <div className="flex items-center gap-0.5">
        <div className="relative group">
          <HeaderIconButton
            onClick={onToggleMode}
            ariaLabel={mode === 'sidebar' ? '플로팅 모드로 전환' : '사이드바 모드로 전환'}
          >
            {mode === 'sidebar' ? (
              <SquareSquare size={18} strokeWidth={1.75} />
            ) : (
              <PanelRight size={18} strokeWidth={1.75} />
            )}
          </HeaderIconButton>
          <Tooltip
            text={mode === 'sidebar' ? '플로팅 모드로 전환' : '사이드바 모드로 전환'}
            side="bottom"
          />
        </div>
        <div className="relative group">
          <HeaderIconButton onClick={onClose} ariaLabel="닫기">
            <Minus size={18} strokeWidth={1.75} />
          </HeaderIconButton>
          <Tooltip text="닫기" side="bottom" />
        </div>
      </div>
    </div>
  );
}

function HeaderIconButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="p-[6px] hover:bg-slate-100 rounded-full transition-colors text-slate-700"
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
