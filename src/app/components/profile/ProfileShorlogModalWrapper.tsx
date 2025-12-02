'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function ProfileShorlogModalWrapper({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const closeModal = () => {
    // URL 쿼리에서 profileId 가져오기
    let profileId = searchParams.get('profileId');

    // pathname에서 프로필 ID 추출
    if (!profileId) {
      const match = pathname.match(/\/profile\/(\d+)/);
      profileId = match ? match[1] : null;
    }

    // sessionStorage에서 가져오기
    if (!profileId && typeof window !== 'undefined') {
      profileId = sessionStorage.getItem('shorlog_profile_user_id');
    }

    if (profileId) {
      // 새로고침 형태로 프로필 페이지 이동
      window.location.href = `/profile/${profileId}`;
    } else {
      router.back();
    }
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
  }, []);

  const handleOverlayClick = () => {
    closeModal();
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
        className="relative flex h-[82vh] w-full max-w-[1200px] px-3 py-4 md:px-6 md:py-5 lg:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

