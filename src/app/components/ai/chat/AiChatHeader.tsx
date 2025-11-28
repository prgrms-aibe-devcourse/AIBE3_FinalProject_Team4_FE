import { PanelRight, SquareSquare, X } from 'lucide-react';
import Tooltip from '../../common/Tooltip';
interface AiChatHeaderProps {
  mode: 'sidebar' | 'floating';
  onToggleMode: () => void;
  onClose: () => void;
}

export default function AiChatHeader({ mode, onToggleMode, onClose }: AiChatHeaderProps) {
  return (
    <div className="flex items-center justify-between py-2 px-4 rounded-t-lg min-w-0 w-full">
      <div className="text-s">TexTok AI</div>
      <div className="flex items-center">
        <div className="relative group">
          <button
            onClick={onToggleMode}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={mode === 'sidebar' ? '플로팅 모드로 전환' : '사이드바 모드로 전환'}
          >
            {mode === 'sidebar' ? (
              <SquareSquare size={18} strokeWidth={1.75} />
            ) : (
              <PanelRight size={18} strokeWidth={1.75} />
            )}
          </button>
          <Tooltip
            text={mode === 'sidebar' ? '플로팅 모드로 전환' : '사이드바 모드로 전환'}
            positionClass="top-full left-1/2 -translate-x-1/2 mt-2"
          />
        </div>
        <div className="relative group">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label="닫기"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
          <Tooltip text="닫기" positionClass="top-full left-1/2 -translate-x-1/2 mt-2" />
        </div>
      </div>
    </div>
  );
}
