import { ModelOption } from '@/src/types/ai';
import { Bot, BotOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Tooltip from '../Tooltip';

interface ModelDropdownProps {
  options: ModelOption[];
  selected: ModelOption;
  onSelect: (value: ModelOption['value']) => void;
  direction?: 'down' | 'up';
}

export default function ModelDropdown({
  options,
  selected,
  onSelect,
  direction = 'down',
}: ModelDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative flex items-center gap-3">
      <div className="relative group">
        <button
          aria-label="모델 변경"
          className="w-auto h-8 rounded-full flex items-center gap-1 px-2 text-slate-500 hover:bg-slate-100 transition"
          type="button"
          onClick={(e) => {
            e.currentTarget.blur(); // ← 클릭 후 포커스 제거
            setOpen((v) => !v);
          }}
        >
          {selected.enabled ? (
            <Bot size={20} strokeWidth={1.2} />
          ) : (
            <BotOff size={20} strokeWidth={1.2} />
          )}
          <span className="ml-1 text-[12.5px] text-slate-700 whitespace-nowrap">
            {selected.label}
          </span>
          {direction === 'up' ? (
            <ChevronUp size={16} className="ml-0.5" />
          ) : (
            <ChevronDown size={16} className="ml-0.5" />
          )}
        </button>
        {/* 모델 선택 버튼 Tooltip */}
        <Tooltip text="모델 선택" side="right" />
      </div>
      {open && (
        <div
          className={`absolute left-0 z-30 min-w-[120px] bg-white border rounded-xl shadow p-1 flex flex-col ${direction === 'up' ? 'bottom-10' : 'top-10'}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === selected.value;
            return (
              <div key={opt.value} className="relative group">
                <button
                  className={`w-full flex items-center gap-2 px-3 py-1 text-[12.5px] rounded-xl transition whitespace-nowrap
                    ${isSelected ? 'text-main' : 'text-slate-700'}
                    ${!opt.enabled ? 'opacity-50' : 'hover:bg-slate-100'}`}
                  onClick={() => {
                    if (opt.enabled) {
                      onSelect(opt.value);
                      setOpen(false);
                    }
                  }}
                  disabled={!opt.enabled}
                >
                  {opt.enabled ? (
                    isSelected ? (
                      <Bot size={16} strokeWidth={1.2} />
                    ) : (
                      <span style={{ width: 16, display: 'inline-block' }} />
                    )
                  ) : (
                    <BotOff size={16} strokeWidth={1.2} />
                  )}
                  <span className="mr-2">{opt.label}</span>
                </button>
                {/* 옵션이 enabled=false(오늘 한도 도달)일 때 Tooltip */}
                {!opt.enabled && <Tooltip text="오늘 한도 도달" side="right" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
