type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
type TooltipAlign = 'left' | 'center' | 'right';

type TooltipPosition = `${TooltipSide}-${TooltipAlign}`;

interface TooltipProps {
  text: string;
  open?: boolean;
  position?: TooltipPosition;
  side?: TooltipSide;
  align?: TooltipAlign;
  positionClass?: string;
  className?: string;
  animationClass?: string;
  style?: React.CSSProperties;
}

export default function Tooltip({
  text,
  open,
  position,
  side = 'top',
  align = 'center',
  positionClass,
  className = 'bg-gray-700 text-white text-[12.5px] text-center font-light px-2 py-1 rounded-md border-none shadow',
  animationClass = '',
  style,
}: TooltipProps) {
  const [ps, pa] = position?.split('-') ?? [];
  const finalSide: TooltipSide =
    ps === 'top' || ps === 'bottom' || ps === 'left' || ps === 'right' ? ps : side;
  const finalAlign: TooltipAlign = pa === 'left' || pa === 'center' || pa === 'right' ? pa : align;

  // side별 기본 위치
  const sideClass =
    finalSide === 'top'
      ? 'bottom-full mb-2'
      : finalSide === 'bottom'
        ? 'top-full mt-2'
        : finalSide === 'right'
          ? 'left-full ml-2'
          : 'right-full mr-2';

  // top/bottom이면 가로정렬, left/right이면 세로정렬
  const alignClass =
    finalSide === 'left' || finalSide === 'right'
      ? finalAlign === 'left'
        ? 'top-0'
        : finalAlign === 'center'
          ? 'top-1/2 -translate-y-1/2'
          : 'bottom-0'
      : finalAlign === 'left'
        ? 'left-0'
        : finalAlign === 'center'
          ? 'left-1/2 -translate-x-1/2'
          : 'right-0';

  const finalPositionClass = positionClass ?? `${sideClass} ${alignClass}`;

  const visibilityClass =
    open === undefined
      ? `opacity-0 group-hover:opacity-100 group-hover:delay-200` // scale-95 group-hover:scale-100 추가 가능
      : open
        ? 'opacity-100 scale-100 delay-200'
        : 'opacity-0 scale-90';

  const transitionClass =
    open === undefined
      ? 'transition-all duration-100' // ease-out 추가 가능
      : 'transition-opacity transition-transform duration-100 ease-out';

  return (
    <div
      style={style}
      className={`
        absolute z-50 pointer-events-none
        ${visibilityClass}
        ${transitionClass}
        ${finalPositionClass}
        ${animationClass}
      `}
    >
      <div className={`whitespace-nowrap ${className}`}>{text}</div>
    </div>
  );
}
