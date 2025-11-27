'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function ShorlogDetailModalWrapper({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.back();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 🔹 모달 열릴 때 body 스크롤 잠그기
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // 🔹 모달 닫힐 때 원래 상태 복원
      document.body.style.overflow = originalOverflow;
    };
  }, [router]);

  const handleOverlayClick = () => {
    router.back();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* 뒤 배경 흐림 */}
      <div
        className="absolute inset-0 bg-[#a7adb8]/65 backdrop-blur-[3px]"
        onClick={handleOverlayClick}
      />

      {/* 모달 컨테이너 */}
      <div
        className="
          relative flex h-[82vh] w-full max-w-[1200px]
          px-3 py-4 md:px-6 md:py-5 lg:px-8
        "
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
