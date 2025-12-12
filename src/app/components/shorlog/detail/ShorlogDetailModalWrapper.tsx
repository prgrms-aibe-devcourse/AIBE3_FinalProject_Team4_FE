'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
  onRequestClose?: () => void;
}

export default function ShorlogDetailModalWrapper({ children, onRequestClose }: Props) {
  const router = useRouter();
  const initialPathRef = useRef<string | null>(null);
  const originalOverflowRef = useRef<string>('');
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (initialPathRef.current === null && typeof window !== 'undefined') {
      const savedInitialPath = sessionStorage.getItem('shorlog_modal_initial_path');

      if (savedInitialPath) {
        initialPathRef.current = savedInitialPath;
      }
    }
  }, []);

  const closeModal = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    // 즉시 body 스크롤 복원
    document.body.style.overflow = originalOverflowRef.current || '';

    // 세션 스토리지 정리
    sessionStorage.removeItem('shorlog_modal_initial_path');
    sessionStorage.removeItem('shorlog_feed_ids');
    sessionStorage.removeItem('shorlog_current_index');

    // 즉시 뒤로가기 실행
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

    originalOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (!isClosingRef.current) {
        document.body.style.overflow = originalOverflowRef.current || '';
      }
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
        className="absolute inset-0 bg-black/55"
        onClick={handleOverlayClick}
      />

      <div
        className="relative flex h-[90vh] sm:h-[85vh] md:h-[82vh] w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[1200px] px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 lg:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

}
