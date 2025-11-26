'use client';

import { SetStateAction, useState } from 'react';
import CropperModal from './crop/CropperModal';
import UnsplashImagePicker from './tabs/UnsplashImageTab';
import UploadTab from './tabs/UploadImageTab';

export default function ImageSelector() {
  const [selectedTab, setSelectedTab] = useState('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl bg-white shadow-sm p-6">
      {/* 탭 메뉴 */}
      <div className="flex border-b mb-6 text-sm font-medium">
        {[
          { key: 'upload', label: '이미지 업로드' },
          { key: 'blog', label: '블로그 본문 이미지' },
          { key: 'unsplash', label: '무료 이미지' },
          { key: 'google', label: '구글 검색 이미지' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`px-4 py-3 border-b-2 transition-all duration-200 ${
              selectedTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      {selectedTab === 'upload' && (
        <UploadTab setSelectedImage={setSelectedImage} setCroppingImage={setCroppingImage} />
      )}

      {selectedTab === 'unsplash' && (
        <UnsplashImagePicker
          onSelect={(url: string) => {
            setSelectedImage(url);
            setCroppingImage(url);
          }}
        />
      )}

      {/* 이미지 미리보기 */}
      {selectedImage && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-2">미리보기</p>
          <img
            src={selectedImage}
            alt="preview"
            className="w-full h-auto rounded-xl object-cover"
          />
        </div>
      )}

      {/* 크롭 모달 */}
      {croppingImage && (
        <CropperModal
          imageUrl={croppingImage}
          onClose={() => setCroppingImage(null)}
          onCrop={(url: SetStateAction<string | null>) => {
            setSelectedImage(url);
            setCroppingImage(null);
          }}
        />
      )}

      {/* 적용하기 */}
      <div className="mt-8 flex justify-end">
        <button className="px-6 py-2 rounded-xl bg-[#2979FF] text-white shadow-sm hover:opacity-90 transition">
          적용하기
        </button>
      </div>
    </div>
  );
}
