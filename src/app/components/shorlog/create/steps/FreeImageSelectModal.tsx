'use client';

import { useState } from 'react';

interface FreeImageSelectModalProps {
  onSelect: (selectedImages: string[]) => void;
  onClose: () => void;
  maxSelect: number;
  apiType: 'unsplash' | 'google';
}

interface ImageResult {
  url: string;
  width?: number;
  height?: number;
}

export default function FreeImageSelectModal({
  onSelect,
  onClose,
  maxSelect,
  apiType,
}: FreeImageSelectModalProps) {
  const [keyword, setKeyword] = useState('');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = apiType === 'unsplash'
        ? `/api/v1/images/unsplash?keyword=${encodeURIComponent(keyword.trim())}&page=0&size=20`
        : `/api/v1/images/google?keyword=${encodeURIComponent(keyword.trim())}&page=0&size=20`;

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`${apiType === 'unsplash' ? 'Unsplash' : 'Google'} 이미지 검색 실패`);
      }

      const result = await response.json();
      const fetchedImages: ImageResult[] = result?.data?.content || [];

      setImages(fetchedImages);

      if (fetchedImages.length === 0) {
        setError('검색 결과가 없습니다. 다른 키워드를 시도해보세요.');
      }
    } catch (e) {
      console.error('이미지 검색 실패:', e);
      setError(e instanceof Error ? e.message : '이미지를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleImage = (url: string) => {
    setSelectedUrls((prev) => {
      if (prev.includes(url)) {
        return prev.filter((u) => u !== url);
      } else {
        if (prev.length >= maxSelect) {
          alert(`최대 ${maxSelect}개까지 선택할 수 있습니다.`);
          return prev;
        }
        return [...prev, url];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedUrls.length === 0) {
      alert('최소 1개 이상의 이미지를 선택해주세요.');
      return;
    }
    onSelect(selectedUrls);
    onClose();
  };

  const title = apiType === 'unsplash' ? 'Unsplash' : 'Google';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            무료 사진 찾기 ({title})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 검색 바 */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={`검색어 입력 (예: ${apiType === 'unsplash' ? 'nature, technology' : '자연, 기술'})`}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#2979FF] focus:bg-white focus:ring-2 focus:ring-[#2979FF]/20"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="rounded-lg bg-[#2979FF] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#1f63d1] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              검색
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#2979FF]" />
            </div>
          )}

          {error && (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {!isLoading && !error && images.length === 0 && (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-slate-500">
                검색어를 입력하고 검색 버튼을 눌러주세요.
              </p>
            </div>
          )}

          {!isLoading && !error && images.length > 0 && (
            <>
              <p className="mb-4 text-sm text-slate-600">
                선택된 이미지: {selectedUrls.length}/{maxSelect}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image, index) => {
                  const isSelected = selectedUrls.includes(image.url);
                  return (
                    <button
                      key={`${image.url}-${index}`}
                      type="button"
                      onClick={() => toggleImage(image.url)}
                      className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition ${
                        isSelected
                          ? 'border-[#2979FF] ring-2 ring-[#2979FF]/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${title} image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#2979FF]/20">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2979FF] text-white">
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedUrls.length === 0}
            className="rounded-full bg-[#2979FF] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1f63d1] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
}

