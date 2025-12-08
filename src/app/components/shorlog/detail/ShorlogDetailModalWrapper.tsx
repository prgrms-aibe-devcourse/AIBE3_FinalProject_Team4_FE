'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
  /** 배경 클릭 / ESC 누를 때 호출되는 훅 (없으면 바로 닫기) */
  onRequestClose?: () => void;
}

export default function ShorlogDetailModalWrapper({ children, onRequestClose }: Props) {
  const router = useRouter();

  const closeModal = () => {
    router.back();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onRequestClose) {
          onRequestClose();
        } else {
          closeModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onRequestClose]);

  const handleOverlayClick = () => {
    if (onRequestClose) {
      onRequestClose();
    } else {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      data-scroll-locked="true"
    >
      <div
        className="absolute inset-0 bg-black/55"  // <-- 회색 + 블러 대신, 살짝 어두운 블랙
        onClick={handleOverlayClick}
      />

      <div
        className="relative flex h-[82vh] w-full max-w-[1200px] px-3 py-4 md:px-6 md:py-5 lg:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

}
