'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [isVisible, setIsVisible] = useState(true);

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

    setIsVisible(false);

    setTimeout(() => {
      document.body.style.overflow = originalOverflowRef.current || '';

      const savedPath = sessionStorage.getItem('shorlog_modal_initial_path');
      sessionStorage.removeItem('shorlog_modal_initial_path');
      sessionStorage.removeItem('shorlog_feed_ids');
      sessionStorage.removeItem('shorlog_current_index');

      const returnPath = initialPathRef.current || savedPath;

      if (returnPath) {
        router.back();
      } else {
        router.replace('/shorlog/feed');
      }
    }, 150);
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

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center transition-opacity duration-150 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
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
