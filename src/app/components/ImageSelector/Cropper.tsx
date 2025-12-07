'use client';

import { Crop } from 'lucide-react';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

const cropOptions = ['원본', '1:1', '4:5', '16:9'];

type AspectInfo = { key: string; ratio: number };
let aspectMap: Record<string, AspectInfo> = {
  원본: { key: 'original', ratio: 1 }, // ratio는 이미지 로드 후 변경
  '1:1': { key: '1:1', ratio: 1 },
  '4:5': { key: '4:5', ratio: 4 / 5 },
  '16:9': { key: '16:9', ratio: 16 / 9 },
};

interface CropperModalProps {
  imageUrl: string;
  initialAspect?: string | null;
  onCrop: (croppedUrl: string, aspect: string) => void;
  onClose: () => void;
}

export default function CropperModal({
  imageUrl,
  initialAspect,
  onCrop,
  onClose,
}: CropperModalProps) {
  // 크롭 비율 관련 상태
  const [aspect, setAspect] = useState<number | undefined>(undefined); // 현재 적용된 비율
  const initialAspectLabel = initialAspect ?? '원본';
  const [selectedAspect, setSelectedAspect] = useState<string>(initialAspectLabel); // 선택된 비율 옵션

  // 크롭 영역 픽셀 정보
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      aspectMap['원본'].ratio = ratio;

      // initialAspect가 null/undefined면 '원본'을 기본값으로 사용
      const aspectKey = initialAspect ?? '원본';
      setAspect(aspectMap[aspectKey]?.ratio || ratio);
    };
    img.src = imageUrl;
  }, [imageUrl, initialAspect]);

  const handleAspectChange = (value: string) => {
    setSelectedAspect(value);
    setAspect(aspectMap[value]?.ratio);
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
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
    if (selectedAspect === '원본') {
      // 원본 선택 시 크롭하지 않고 원본 이미지 URL 전달
      onCrop(imageUrl, '원본');
      return;
    }
    if (croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCrop(croppedImage, selectedAspect);
    }
  };

  return (
    <>
      <style>{`
        .reactEasyCrop_CropArea {
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>

      {/* 헤더: 제목 + 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-1">
          <Crop className="w-4 h-4 mr-1" />
          이미지 자르기
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-xl border text-slate-600 hover:bg-slate-100"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs rounded-xl bg-main text-white hover:bg-blue-500"
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
            className={`px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-colors ${
              selectedAspect === opt
                ? 'bg-slate-100 border-main text-main'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}
