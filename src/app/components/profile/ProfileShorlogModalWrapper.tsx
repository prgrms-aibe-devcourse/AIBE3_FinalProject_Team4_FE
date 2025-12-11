'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function ProfileShorlogModalWrapper({ children }: Props) {
  const router = useRouter();
  const originalOverflowRef = useRef<string>('');
  const isClosingRef = useRef(false);
  const [isVisible, setIsVisible] = useState(true);

  const closeModal = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    sessionStorage.setItem('profile_modal_closing', 'true');

    document.body.style.overflow = originalOverflowRef.current || '';

    setIsVisible(false);

    router.back();

    setTimeout(() => {
      sessionStorage.removeItem('profile_modal_closing');
    }, 300);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
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
  }, []);

  const handleOverlayClick = () => {
    closeModal();
  };

  if (!isVisible) {
    return null;
  }

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

