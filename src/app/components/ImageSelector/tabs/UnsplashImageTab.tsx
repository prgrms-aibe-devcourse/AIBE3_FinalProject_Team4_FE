'use client';

import { useState } from 'react';

interface UnsplashImagePickerProps {
  onSelect: (url: string) => void;
}

export default function UnsplashImagePicker({ onSelect }: UnsplashImagePickerProps) {
  const [keyword, setKeyword] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const search = async () => {
    const res = await fetch(`/api/v1/images/unsplash?keyword=${keyword}&number=20`);
    const data = await res.json();
    setImages(data.images || []);
  };

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어 입력"
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          onClick={search}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-500"
        >
          검색
        </button>
      </div>

      {/* 이미지 목록 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="unsplash"
            onClick={() => onSelect(img)}
            className="rounded-lg cursor-pointer hover:opacity-80"
          />
        ))}
      </div>
    </div>
  );
}
