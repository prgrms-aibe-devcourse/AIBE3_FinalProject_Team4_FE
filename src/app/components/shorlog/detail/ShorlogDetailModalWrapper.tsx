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

    sessionStorage.setItem('shorlog_modal_closing', 'true');

    document.body.style.overflow = originalOverflowRef.current || '';

    setIsVisible(false);

    // 돌아갈 경로 결정
    let returnPath = '/shorlog/feed'; // 기본값

    // 1순위: initialPathRef에 저장된 경로 (블로그 등에서 직접 열었을 때)
    if (initialPathRef.current) {
      returnPath = initialPathRef.current;
    }
    // 2순위: 세션 스토리지에 저장된 초기 경로
    else if (typeof window !== 'undefined') {
      const savedPath = sessionStorage.getItem('shorlog_modal_initial_path');
      if (savedPath) {
        returnPath = savedPath;
      }
    }

    // 세션 스토리지 정리
    sessionStorage.removeItem('shorlog_modal_initial_path');
    sessionStorage.removeItem('shorlog_feed_ids');
    sessionStorage.removeItem('shorlog_current_index');
    // 블로그에서 숏로그로 왔다가 돌아가는 경우를 위해 이 값은 유지
    // sessionStorage.removeItem('blog_return_to_shorlog');

    router.replace(returnPath);

    setTimeout(() => {
      sessionStorage.removeItem('shorlog_modal_closing');
    }, 300);
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
