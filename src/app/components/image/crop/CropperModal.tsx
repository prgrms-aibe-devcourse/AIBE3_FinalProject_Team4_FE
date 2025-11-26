'use client';

import { useState } from 'react';
import Cropper from 'react-easy-crop';

export default function CropperModal({ imageUrl, onClose, onCrop }: any) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(1);

  const cropOptions = [
    { label: '1:1', value: 1 },
    { label: '4:5', value: 4 / 5 },
    { label: '16:9', value: 16 / 9 },
    { label: 'Original', value: undefined },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-[999]">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-slideUp">
        <h2 className="text-lg font-semibold mb-4">이미지 크롭</h2>

        {/* 이미지 크롭 영역 */}
        <div className="relative w-full h-[300px] sm:h-[350px] bg-gray-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
          />
        </div>

        {/* 비율 선택 */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {cropOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setAspect(opt.value)}
              className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-100 whitespace-nowrap"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>

          <button
            onClick={() => onCrop(imageUrl)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
