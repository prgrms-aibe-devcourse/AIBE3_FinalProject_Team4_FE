'use client';

import { useMemo, useState } from 'react';
import { AspectRatio, LocalImage } from '../types';

interface ImageEditStepProps {
  images: LocalImage[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeAspectRatio: (id: string, ratio: AspectRatio) => void;
  onDeleteImage: (id: string) => void;
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isUploading: boolean;
}

export default function ImageEditStep({
                                        images,
                                        selectedIndex,
                                        setSelectedIndex,
                                        onFileInputChange,
                                        onChangeAspectRatio,
                                        onDeleteImage,
                                        onReorderImages,
                                        onPrev,
                                        onNext,
                                        isUploading,
                                      }: ImageEditStepProps) {
  const selected = images[selectedIndex];
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const aspectOptions: { value: AspectRatio; label: string }[] = [
    { value: 'ORIGINAL', label: '원본' },
    { value: '1:1', label: '1:1' },
    { value: '4:5', label: '4:5' },
    { value: '16:9', label: '16:9' },
  ];

  const aspectClass = useMemo(() => {
    if (!selected) return 'aspect-video';
    switch (selected.aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '4:5':
        return 'aspect-[4/5]';
      case '16:9':
        return 'aspect-video';
      case 'ORIGINAL':
      default:
        return 'aspect-[4/3]';
    }
  }, [selected]);

  const handleThumbDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    onReorderImages(dragIndex, index);
    setDragIndex(null);
  };

  if (!selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">편집할 이미지가 없습니다. 먼저 이미지를 선택해주세요.</p>
        <button
          type="button"
          onClick={onPrev}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
        >
          섬네일 선택으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col gap-4 md:flex-row">
      {/* 업로드 중 오버레이 */}
      {isUploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
            <svg
              className="h-12 w-12 animate-spin text-[#2979FF]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">이미지 업로드 중</p>
              <p className="mt-1 text-sm text-slate-500">잠시만 기다려주세요...</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3">
        <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-100 ${aspectClass}`}>
          <img
            src={selected.previewUrl}
            alt={selected.originalFilename ?? '편집 이미지'}
            className={
              selected.aspectRatio === 'ORIGINAL'
                ? 'max-h-[520px] w-auto object-contain mx-auto'
                : 'h-full w-full object-cover'
            }
          />

          <button
            type="button"
            onClick={() => onDeleteImage(selected.id)}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-xs font-medium text-white shadow-sm hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            ×
            <span className="sr-only">이미지 삭제</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {aspectOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeAspectRatio(selected.id, opt.value)}
              className={[
                'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                selected.aspectRatio === opt.value
                  ? 'border-[#2979FF] bg-[#2979FF]/5 text-[#2979FF]'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col justify-between md:w-[260px]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">
              이미지 순서 ({images.length}/10)
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const input = document.getElementById(
                  'shorlog-file-input-step2',
                ) as HTMLInputElement | null;
                input?.click();
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
            >
              + 추가
            </button>
            <input
              id="shorlog-file-input-step2"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileInputChange}
              className="hidden"
            />
          </div>

          <div className="flex max-h-[260px] flex-col gap-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleThumbDrop(i)}
                onClick={() => setSelectedIndex(i)}
                className={[
                  'group flex w-full items-center gap-2 rounded-xl border bg-white p-1.5 text-left text-xs shadow-sm transition',
                  i === selectedIndex
                    ? 'border-[#2979FF] ring-1 ring-[#2979FF]/40'
                    : 'border-slate-200 hover:border-slate-300',
                ].join(' ')}
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={img.previewUrl}
                    alt={img.originalFilename ?? '썸네일'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="line-clamp-1 text-[11px] text-slate-700">
                    {img.originalFilename ?? '이미지'}
                  </span>
                  <span className="mt-0.5 text-[10px] text-slate-400">
                    순서 {i + 1} · 비율 {img.aspectRatio}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600">
                  ⠿
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            이전
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isUploading || !images.length}
            className="relative min-w-[140px] rounded-full bg-[#2979FF] px-6 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#1f63d1] disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            다음 (업로드)
          </button>
        </div>
      </div>
    </div>
  );
}
