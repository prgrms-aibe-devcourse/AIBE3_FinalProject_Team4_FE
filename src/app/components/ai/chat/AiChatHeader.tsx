interface AiChatHeaderProps {
  mode: 'sidebar' | 'floating';
  onToggleMode: () => void;
  onClose: () => void;
}

export default function AiChatHeader({ mode, onToggleMode, onClose }: AiChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg min-w-0 w-full">
      <h2 className="text-lg font-semibold">텍톡 AI</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMode}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title={mode === 'sidebar' ? '플로팅 모드로 전환' : '사이드바 모드로 전환'}
        >
          {mode === 'sidebar' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25"
              />
            </svg>
          )}
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="닫기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
