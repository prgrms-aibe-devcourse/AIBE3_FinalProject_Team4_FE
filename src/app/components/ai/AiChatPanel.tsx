'use client';

import { useEffect, useState } from 'react';
import AIChat from './AiChat';

type DisplayMode = 'sidebar' | 'floating';

export default function AiChatSideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DisplayMode>('sidebar');

  const toggleMode = () => {
    setMode((prev) => (prev === 'sidebar' ? 'floating' : 'sidebar'));
  };

  // isOpen일 때 바깥 스크롤 잠그기
  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('overflow-hidden');
      document.body.classList.add('overflow-hidden');
    } else {
      document.documentElement.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    }

    // 컴포넌트 언마운트 시 안전하게 복구
    return () => {
      document.documentElement.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  return (
    <>
      {/* 열기 버튼 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          aria-label="AI 채팅 열기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </button>
      )}

      {/* 사이드바 모드 */}
      {isOpen && mode === 'sidebar' && (
        <div
          className="
            fixed top-0 right-0 h-dvh
            w-[min(24rem,100vw)]  /* ✅ 화면 좁으면 100vw로 줄어듦 */
            max-w-full
            bg-white shadow-2xl border-l border-gray-200
            flex flex-col z-50
          "
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">텍톡 AI</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMode}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="플로팅 모드로 전환"
              >
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
              </button>
              <button
                onClick={() => setIsOpen(false)}
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

          {/* AI 채팅 컴포넌트 (내부만 스크롤) */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <AIChat />
          </div>
        </div>
      )}

      {/* 플로팅 모드 */}
      {isOpen && mode === 'floating' && (
        <div
          className="
            fixed bottom-6 right-6
            w-[min(24rem,100vw-3rem)]  /* 작은 화면 대응 */
            h-[min(600px,100dvh-3rem)]
            bg-white shadow-2xl rounded-lg border border-gray-200
            z-50 flex flex-col
          "
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold">텍톡 AI</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMode}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="사이드바 모드로 전환"
              >
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
              </button>
              <button
                onClick={() => setIsOpen(false)}
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

          {/* AI 채팅 컴포넌트 (내부만 스크롤) */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <AIChat />
          </div>
        </div>
      )}
    </>
  );
}
