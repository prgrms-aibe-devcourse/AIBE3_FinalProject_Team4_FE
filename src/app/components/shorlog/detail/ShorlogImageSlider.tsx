'use client';

import { useEffect, useState } from 'react';

interface Props {
  images: string[];
  alt?: string;
}

export default function ShorlogImageSlider({ images, alt }: Props) {
  const safeImages = images && images.length > 0 ? images : ['/placeholder-image.png'];
  const [index, setIndex] = useState(0);
  const hasMultiple = safeImages.length > 1;

  const goPrev = () => setIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  const goNext = () => setIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    if (!hasMultiple) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultiple, index]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border-[3px] border-[#2979FF] bg-black">
      <img
        src={safeImages[index]}
        alt={alt ? `${alt} 이미지 ${index + 1}` : `숏로그 이미지 ${index + 1}`}
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="이전 이미지"
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:bg-white hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="다음 이미지"
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:bg-white hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 text-xs font-medium text-white backdrop-blur">
              <span>{index + 1}</span>
              <span className="text-slate-400">/</span>
              <span>{safeImages.length}</span>
            </div>
          </div>

          {/* 인디케이터 점들 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center">
            <div className="flex items-center gap-1.5">
              {safeImages.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === index
                      ? 'w-6 bg-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
