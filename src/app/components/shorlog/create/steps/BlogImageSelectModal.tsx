'use client';

import { useState, useEffect } from 'react';
import { BlogImage } from '../types';

interface BlogImageSelectModalProps {
  blogId: string;
  onSelect: (selectedImages: string[]) => void;
  onClose: () => void;
  maxSelect: number;
}

export default function BlogImageSelectModal({
  blogId,
  onSelect,
  onClose,
  maxSelect,
}: BlogImageSelectModalProps) {
  const [blogImages, setBlogImages] = useState<BlogImage[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogImages();
  }, [blogId]);

  const fetchBlogImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: 실제 API 호출로 교체 (3번 이연서 협업)
      const response = await fetch(`/api/v1/blogs/${blogId}/images`);
      if (!response.ok) {
        throw new Error('블로그 이미지 조회 실패');
      }
      const data = await response.json();
      setBlogImages(data.images || []);
    } catch (e) {
      console.error('블로그 이미지 조회 실패:', e);
      setError('블로그 이미지를 불러오는데 실패했습니다.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            블로그 사진 선택
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

          {!isLoading && !error && blogImages.length === 0 && (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-slate-500">
                블로그에 이미지가 없습니다.
              </p>
            </div>
          )}

          {!isLoading && !error && blogImages.length > 0 && (
            <>
              <p className="mb-4 text-sm text-slate-600">
                선택된 이미지: {selectedUrls.length}/{maxSelect}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {blogImages.map((image) => {
                  const isSelected = selectedUrls.includes(image.imageUrl);
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => toggleImage(image.imageUrl)}
                      className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition ${
                        isSelected
                          ? 'border-[#2979FF] ring-2 ring-[#2979FF]/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.originalFilename}
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

