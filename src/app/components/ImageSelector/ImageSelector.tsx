'use client';

import { uploadBlogImage } from '@/src/api/blogApi';
import { SetStateAction, useState } from 'react';
import Cropper from './Cropper';
import BlogImageTab from './tabs/BlogImageTab';
import UnsplashImagePicker from './tabs/UnsplashImageTab';
import UploadTab from './tabs/UploadImageTab';

export interface BlogImage {
  imageId: number;
  url: string;
  sortOrder: number;
  contentType: string;
}

interface ImageSelectorProps {
  blogId: string;
  blogImages: BlogImage[];
}

export default function ImageSelector({ blogId, blogImages }: ImageSelectorProps) {
  const [selectedTab, setSelectedTab] = useState('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [lastAspect, setLastAspect] = useState<string>('원본');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [imageSourceType, setImageSourceType] = useState<'file' | 'url'>('file');
  const [unsplashSearchKeyword, setUnsplashSearchKeyword] = useState('');
  const [googleSearchKeyword, setGoogleSearchKeyword] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // 파일 업로드인 경우
    if (imageSourceType === 'file' && uploadedFile) {
      formData.append('files', uploadedFile);
    }
    // URL인 경우
    else if (imageSourceType === 'url' && originalImage) {
      formData.append('url', originalImage);
    }

    formData.append('type', 'THUMBNAIL');

    // aspectRatios 변환 ("원본" -> "original")
    const aspectRatioMap: Record<string, string> = {
      원본: 'original',
      '1:1': '1:1',
      '4:5': '4:5',
      '16:9': '16:9',
    };
    formData.append('aspectRatios', aspectRatioMap[lastAspect] || 'original');

    try {
      const response = await uploadBlogImage(blogId, formData);

      if (response.ok) {
        showToast('썸네일이 성공적으로 업로드되었습니다!', 'success');
      } else {
        // 상태코드별 메시지
        if (response.status === 401) {
          showToast('로그인이 필요합니다. 다시 로그인해주세요.', 'error');
        } else if (response.status === 403) {
          showToast('접근 권한이 없습니다.', 'error');
        } else if (response.status === 404) {
          showToast('블로그를 찾을 수 없습니다.', 'error');
        } else if (response.status >= 500) {
          showToast('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        } else {
          showToast('업로드에 실패했습니다.', 'error');
        }
      }
    } catch (error) {
      showToast('네트워크 오류가 발생했습니다.', 'error');
      console.error('업로드 중 오류 발생:', error);
    }
  };

  return (
    <>
      {/* 토스트 메시지 */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg text-white ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

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
          <UploadTab
            uploadedFile={uploadedFile}
            uploadedFileUrl={uploadedFileUrl}
            selectedImage={selectedImage}
            originalImage={originalImage}
            setSelectedImage={setSelectedImage}
            setCroppingImage={setCroppingImage}
            setOriginalImage={setOriginalImage}
            setUploadedFile={setUploadedFile}
            setUploadedFileUrl={setUploadedFileUrl}
            setImageSourceType={setImageSourceType}
          />
        )}

        {selectedTab === 'blog' && (
          <BlogImageTab
            images={blogImages}
            selectedImage={selectedImage}
            onSelect={(url: string) => {
              setSelectedImage(url);
              setCroppingImage(url);
              setOriginalImage(url);
              setImageSourceType('url');
            }}
          />
        )}

        {selectedTab === 'unsplash' && (
          <UnsplashImagePicker
            searchKeyword={unsplashSearchKeyword}
            onSearchKeywordChange={setUnsplashSearchKeyword}
            selectedImage={selectedImage}
            originalImage={originalImage}
            onSelect={(url: string) => {
              setSelectedImage(url);
              setCroppingImage(url);
              setOriginalImage(url);
              setImageSourceType('url');
            }}
          />
        )}

        {selectedTab === 'google' && (
          <UnsplashImagePicker
            searchKeyword={googleSearchKeyword}
            onSearchKeywordChange={setGoogleSearchKeyword}
            selectedImage={selectedImage}
            originalImage={originalImage}
            onSelect={(url: string) => {
              setSelectedImage(url);
              setCroppingImage(url);
              setOriginalImage(url);
              setImageSourceType('url');
            }}
            apiEndpoint="google"
          />
        )}

        {/* 이미지 미리보기 또는 크롭 */}
        {selectedImage && !isCropping && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">미리보기</p>
              <button
                onClick={() => {
                  setCroppingImage(originalImage);
                  setIsCropping(true);
                }}
                className="px-2 py-1 text-xs rounded border text-gray-600 hover:bg-gray-100"
              >
                자르기
              </button>
            </div>
            <img
              src={selectedImage}
              alt="preview"
              className="w-full h-[300px] sm:h-[350px] object-contain bg-gray-50 rounded-none"
            />
          </div>
        )}

        {/* 크롭 모드 */}
        {isCropping && croppingImage && (
          <div className="mt-6">
            <Cropper
              imageUrl={croppingImage}
              initialAspect={lastAspect}
              onClose={() => {
                setIsCropping(false);
                setCroppingImage(null);
              }}
              onCrop={(url: SetStateAction<string | null>, aspect: any) => {
                setSelectedImage(url);
                setLastAspect(aspect);
                setIsCropping(false);
                setCroppingImage(null);
              }}
            />
          </div>
        )}

        {/* 적용하기 */}
        {!isCropping && selectedImage && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-xl bg-[#2979FF] text-white shadow-sm hover:opacity-90 transition"
            >
              적용하기
            </button>
          </div>
        )}
      </div>
    </>
  );
}
