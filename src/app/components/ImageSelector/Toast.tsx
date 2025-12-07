import { AlertTriangle, Check, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
}

export default function Toast({ message, type = 'error' }: ToastProps) {
  // 색상 및 스타일 매핑
  const styleMap = {
    success: {
      bg: 'bg-[#f6fefc]', // teal-50/60
      border: 'border-green-300',
      text: 'text-green-700',
      icon: <Check className="w-5 h-5 mr-2 text-green-500" />,
    },
    warning: {
      bg: 'bg-[#fefdef]', // yellow-50/70
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />,
    },
    error: {
      bg: 'bg-[#fff9fa]', // rose-50/40
      border: 'border-rose-100',
      text: 'text-rose-700',
      icon: <XCircle className="w-5 h-5 mr-2 text-rose-400" />,
    },
  };

  const style = styleMap[type] || styleMap.error;

  return (
    <div
      className="
        fixed bottom-8 z-50
        left-[calc(50%+2.5rem)] xl:left-[calc(50%+7.5rem)]
        -translate-x-1/2
    "
      style={{
        transform: 'translateX(-50%)',
        animation: 'toast-up 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <style>{`
        @keyframes toast-up {
          from { opacity: 0; transform: translateX(-50%) translateY(40px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div
        className={`flex flex-row items-center justify-center rounded-2xl border px-5 py-4 text-center min-w-[220px] max-w-[320px] ${style.bg} ${style.border}`}
      >
        {style.icon}
        <p className={`text-sm font-medium ${style.text}`}>{message}</p>
      </div>
    </div>
  );
}
