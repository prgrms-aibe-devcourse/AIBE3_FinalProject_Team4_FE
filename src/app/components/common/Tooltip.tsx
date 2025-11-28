interface TooltipProps {
  text: string;
  className?: string;
  animationClass?: string;
  positionClass?: string;
  style?: React.CSSProperties;
}

export default function Tooltip({
  text,
  className = 'bg-neutral-800 text-white text-xs font-light px-2 py-1 rounded-md border-none shadow-lg',
  animationClass,
  positionClass = 'bottom-full right-0 mb-2',
  style,
}: TooltipProps) {
  return (
    <div
      style={style}
      className={`
        absolute pointer-events-none
        opacity-0 scale-30 group-hover:opacity-100 group-hover:scale-100 transition-all duration-100 ease-out group-hover:delay-200
        ${positionClass}
        ${animationClass}
      `}
    >
      <div className={`whitespace-nowrap ${className}`}>{text}</div>
    </div>
  );
}
