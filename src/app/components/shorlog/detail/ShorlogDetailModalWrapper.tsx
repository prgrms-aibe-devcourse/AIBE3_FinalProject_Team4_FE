'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
  onRequestClose?: () => void;
}

export default function ShorlogDetailModalWrapper({ children, onRequestClose }: Props) {
  const router = useRouter();
  const originalOverflowRef = useRef<string>('');
  const isClosingRef = useRef(false);
  const [isDirectAccess, setIsDirectAccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const closeModal = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    sessionStorage.setItem('shorlog_modal_closing', 'true');

    document.body.style.overflow = originalOverflowRef.current || '';

    router.back();

    setTimeout(() => {
      sessionStorage.removeItem('shorlog_modal_closing');
    }, 300);
  };

  const handleCloseToFeed = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    // 세션 스토리지 정리
    sessionStorage.removeItem('shorlog_modal_closing');
    sessionStorage.removeItem('shorlog_modal_initial_path');

    // 바디 스크롤 복원
    document.body.style.overflow = originalOverflowRef.current || '';

    // 완전히 새로운 페이지로 이동 (모달 상태 초기화)
    window.location.href = '/shorlog/feed';
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkDirectAccess = () => {
        const initialPath = sessionStorage.getItem('shorlog_modal_initial_path');
        return window.history.length <= 1 || !initialPath;
      };

      setIsDirectAccess(checkDirectAccess());

      const checkMobile = () => {
        return window.innerWidth < 768; // Tailwind의 md breakpoint
      };

      setIsMobile(checkMobile());

      const handleResize = () => {
        setIsMobile(checkMobile());
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

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
        onTouchEnd={handleOverlayClick}
        style={{ touchAction: 'auto' }}
      />

      <div
        className="relative flex h-[90vh] sm:h-[85vh] md:h-[82vh] w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[1200px] px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 lg:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {isDirectAccess && isMobile && (
          <button
            type="button"
            aria-label="숏피드로 이동"
            onClick={handleCloseToFeed}
            className="absolute -top-2 -right-2 z-[80] flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-slate-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-slate-700"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );

}
