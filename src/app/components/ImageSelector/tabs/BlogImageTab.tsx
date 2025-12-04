'use client';

import { Check } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface BlogImage {
  imageId: number;
  url: string;
  sortOrder: number;
  contentType: string;
}

interface BlogImageTabProps {
  images: BlogImage[];
  originalImage: string | null;
  onSelect: (url: string | null) => void;
}

export default function BlogImageTab({ images, originalImage, onSelect }: BlogImageTabProps) {
  const selectedImageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedImageRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = selectedImageRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const offset = elementRect.top - containerRect.top + scrollTop - 9;

      container.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }, []);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-[141px]">
        <p className="text-xs text-slate-500">블로그 본문에 업로드된 이미지가 아직 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-slate-600 mb-4">블로그 본문에 사용된 이미지 {images.length}개</p>

      {/* 이미지 목록 */}
      <div ref={scrollContainerRef} className="max-h-[400px] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 pl-2 pb-2">
          {images.map((image) => {
            const isSelected = originalImage === image.url;
            return (
              <div
                key={image.imageId}
                ref={isSelected ? selectedImageRef : null}
                onClick={() => {
                  if (!isSelected) {
                    onSelect(image.url);
                  } else {
                    onSelect(null);
                  }
                }}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition ${
                  isSelected ? 'ring-2 ring-main ring-offset-2' : 'border border-slate-200'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Blog image ${image.sortOrder}`}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-main rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
