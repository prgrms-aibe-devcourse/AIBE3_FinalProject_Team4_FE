'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

export default function CropperModal({ imageUrl, initialAspect, onClose, onCrop }: any) {
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [originalAspect, setOriginalAspect] = useState<number | undefined>(undefined);
  const [selectedAspect, setSelectedAspect] = useState<string>(initialAspect || '원본');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      setOriginalAspect(ratio);

      // initialAspect가 있으면 그것을 사용, 없으면 원본 비율
      if (initialAspect && initialAspect !== '원본') {
        const aspectMap: Record<string, number> = {
          '1:1': 1,
          '4:5': 4 / 5,
          '16:9': 16 / 9,
        };
        setAspect(aspectMap[initialAspect] || ratio);
      } else {
        setAspect(ratio);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, initialAspect]);

  const cropOptions = ['원본', '1:1', '4:5', '16:9'];

  const handleAspectChange = (value: string) => {
    setSelectedAspect(value);
    if (value === '원본') {
      setAspect(originalAspect);
    } else {
      const aspectMap: Record<string, number> = {
        '1:1': 1,
        '4:5': 4 / 5,
        '16:9': 16 / 9,
      };
      setAspect(aspectMap[value]);
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        }
      }, 'image/jpeg');
    });
  };

  const handleSave = async () => {
    if (croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCrop(croppedImage, selectedAspect);
    }
  };

  return (
    <>
      {/* 헤더: 제목 + 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600">이미지 자르기</h3>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs rounded border text-gray-600 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500"
          >
            저장
          </button>
        </div>
      </div>

      {/* 이미지 크롭 영역 */}
      <div className="relative w-full h-[300px] sm:h-[350px] bg-gray-100 overflow-hidden cursor-not-allowed mb-4">
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
          {aspect && (
            <Cropper
              image={imageUrl}
              crop={{ x: 0, y: 0 }}
              aspect={aspect}
              onCropChange={() => {}}
              onCropComplete={onCropComplete}
              restrictPosition={true}
              showGrid={false}
            />
          )}
        </div>
      </div>

      {/* 비율 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {cropOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => handleAspectChange(opt)}
            className={`px-4 py-2 rounded-xl border text-sm whitespace-nowrap transition-colors ${
              selectedAspect === opt
                ? 'bg-gray-100 border-gray-300 text-gray-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}
