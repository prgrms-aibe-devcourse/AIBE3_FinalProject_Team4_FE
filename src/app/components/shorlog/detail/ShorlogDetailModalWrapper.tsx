'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function ShorlogDetailModalWrapper({ children }: Props) {
  const router = useRouter();

  const closeModal = () => {
    // 페이지 전체를 리로드하여 모달 확실히 닫기
    window.location.href = '/shorlog/feed';
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [router]);

  const handleOverlayClick = () => {
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      data-scroll-locked="true"
    >

      <div
        className="absolute inset-0 bg-[#a7adb8]/65 backdrop-blur-[3px]"
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
