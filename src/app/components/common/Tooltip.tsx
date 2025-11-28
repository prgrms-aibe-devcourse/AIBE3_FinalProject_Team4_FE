interface TooltipProps {
  text: string;
  className?: string;
  animationClass?: string;
}

export default function Tooltip({
  text,
  className = 'bg-white text-[15px] text-gray-700 border border-gray-200',
  animationClass = 'opacity-0 scale-70 group-hover:opacity-100 group-hover:scale-100 transition-all duration-100 ease-out',
}: TooltipProps) {
  return (
    <div className={`absolute bottom-full right-0 mb-2 pointer-events-none ${animationClass}`}>
      <div
        className={`${className} px-3 py-2 rounded-[10px] whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.12)]`}
      >
        {text}
      </div>
    </div>
  );
}
