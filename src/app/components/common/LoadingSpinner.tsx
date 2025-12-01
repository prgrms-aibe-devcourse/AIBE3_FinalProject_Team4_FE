interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  inline?: boolean;
  theme?: 'default' | 'light';
}

export default function LoadingSpinner({
  label = '로딩 중입니다',
  size = 'md',
  fullScreen = false,
  inline = false,
  theme = 'default'
}: LoadingSpinnerProps) {
  const dimensions = {
    sm: 'h-4 w-4 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-[5px]',
  };

  const colors = {
    default: 'border-slate-200 border-t-[#2979FF]',
    light: 'border-white/30 border-t-white',
  };

  // 인라인 모드일 때는 스피너만 반환
  if (inline) {
    return (
      <div className={`${dimensions[size]} ${colors[theme]} animate-spin rounded-full`} role="status" aria-label="로딩 중" />
    );
  }

  const spinnerElement = (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div className={`${dimensions[size]} ${colors[theme]} animate-spin rounded-full`} />
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}

