'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShorlogCreateWizard from './ShorlogCreateWizard';
import ShorlogDetailModalWrapper from '../../detail/ShorlogDetailModalWrapper';

interface ShorlogCreateModalProps {
  blogId?: number | null;
}

export default function ShorlogCreateModal({ blogId }: ShorlogCreateModalProps) {
  const router = useRouter();
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const handleRequestClose = () => setShowConfirmExit(true);
  const handleConfirmExit = () => { router.back(); };
  const handleCancelExit = () => setShowConfirmExit(false);

  return (
    <ShorlogDetailModalWrapper onRequestClose={handleRequestClose}>
      <div className="relative flex h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        <ShorlogCreateWizard blogId={blogId} />

        {showConfirmExit && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30">
            <div className="w-[320px] overflow-hidden rounded-3xl bg-white text-center shadow-xl">
              <div className="px-6 pt-6 pb-3">
                <p className="text-sm font-semibold text-slate-900">
                  작성 중인 숏로그에서 나가시겠어요?
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  지금 나가면 작성 중인 내용이 저장되지 않습니다.
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
    </ShorlogDetailModalWrapper>
  );
}

