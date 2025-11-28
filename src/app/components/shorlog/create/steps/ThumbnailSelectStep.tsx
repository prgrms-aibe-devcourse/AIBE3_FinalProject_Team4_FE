'use client';

import { LocalImage } from '../types';

interface ThumbnailSelectStepProps {
  images: LocalImage[];
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddFiles: (files: File[]) => void;
  onNext: () => void;
  onUnsplashPhoto: () => void;
  onGooglePhoto: () => void;
}

export default function ThumbnailSelectStep({
  images,
  onFileInputChange,
  onAddFiles,
  onNext,
  onUnsplashPhoto,
  onGooglePhoto,
}: ThumbnailSelectStepProps) {
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;
    onAddFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const hasImages = images.length > 0;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex w-full max-w-[520px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center shadow-sm transition hover:border-[#2979FF] hover:bg-white hover:shadow-md focus-within:outline-none focus-within:ring-2 focus-within:ring-[#2979FF]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-2xl">🖼️</span>
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900">
          섬네일로 사용할 사진을 선택하세요
        </p>
        <p className="mt-1 text-xs text-slate-500">
          JPG / PNG / WEBP 형식의 이미지를 1~10장까지 업로드할 수 있어요.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="rounded-full bg-[#2979FF] px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#1f63d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
            onClick={(e) => {
              e.preventDefault();
              const input = document.getElementById(
                'shorlog-file-input',
              ) as HTMLInputElement | null;
              input?.click();
            }}
          >
            컴퓨터에서 선택
          </button>
          <button
            type="button"
            onClick={onUnsplashPhoto}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            무료 사진 (Unsplash)
          </button>
          <button
            type="button"
            onClick={onGooglePhoto}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            무료 사진 (Google)
          </button>
        </div>

        <input
          id="shorlog-file-input"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileInputChange}
          className="hidden"
        />
      </label>

      {hasImages && (
        <div className="w-full max-w-[520px]">
          <p className="mb-2 text-xs font-medium text-slate-600">
            선택된 이미지 ({images.length}/10)
          </p>
          <div className="flex max-h-24 gap-2 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/60 p-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
              >
                <img
                  src={img.previewUrl}
                  alt={img.originalFilename ?? '선택된 이미지'}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex w-full max-w-[520px] items-center justify-end gap-2">
        <button
          type="button"
          disabled={!hasImages}
          onClick={onNext}
          className="rounded-full bg-[#2979FF] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1f63d1] disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
        >
          다음 단계로
        </button>
      </div>
    </div>
  );
}
