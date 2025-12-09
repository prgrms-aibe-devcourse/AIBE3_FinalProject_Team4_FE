'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShorlogEditWizard from './steps/ShorlogEditWizard';
import type { ShorlogDetail } from '../detail/types';

interface ShorlogEditModalProps {
  shorlogId: string;
  initialData: ShorlogDetail;
}

export default function ShorlogEditModal({ shorlogId, initialData }: ShorlogEditModalProps) {
  const router = useRouter();
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const handleRequestClose = () => setShowConfirmExit(true);
  const handleConfirmExit = () => {
    router.back();
  };
  const handleCancelExit = () => setShowConfirmExit(false);

  // ESC 키 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !showConfirmExit) {
        handleRequestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirmExit]);

  // 배경 클릭 처리
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !showConfirmExit) {
      handleRequestClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50"
      onClick={handleBackgroundClick}
    >
      <div
        className="h-[90vh] sm:h-[85vh] md:h-[90vh] w-[95vw] sm:w-[90vw] max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ShorlogEditWizard shorlogId={shorlogId} initialData={initialData} />
      </div>

      {showConfirmExit && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30">
          <div className="w-[320px] overflow-hidden rounded-3xl bg-white text-center shadow-xl">
            <div className="px-6 pt-6 pb-3">
              <p className="text-sm font-semibold text-slate-900">
                수정을 취소하시겠어요?
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                지금 나가면 수정 중인 내용이 저장되지 않습니다.
              </p>
            </div>
            <div className="border-t border-slate-200 text-sm">
              <button
                type="button"
                onClick={handleConfirmExit}
                className="block w-full px-4 py-3 font-semibold text-red-500 hover:bg-red-50"
              >
                나가기
              </button>
              <div className="h-px bg-slate-200" />
              <button
                type="button"
                onClick={handleCancelExit}
                className="block w-full px-4 py-3 text-slate-700 hover:bg-slate-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

