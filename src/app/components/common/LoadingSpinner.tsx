interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  label = '로딩 중입니다',
  size = 'md',
  fullScreen = false
}: LoadingSpinnerProps) {
  const dimensions = {
    sm: 'h-8 w-8 border-3',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-[5px]',
  };

  const spinnerElement = (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div className={`${dimensions[size]} animate-spin rounded-full border-slate-200 border-t-[#2979FF]`} />
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

