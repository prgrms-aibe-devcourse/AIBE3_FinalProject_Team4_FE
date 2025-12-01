'use client';

// import { uploadBlogImage } from '@/src/api/blogImageApi';
import { SetStateAction, useState } from 'react';
import Cropper from './Cropper';
import BlogImageTab from './tabs/BlogImageTab';
import UnsplashImagePicker from './tabs/UnsplashImageTab';
import UploadTab from './tabs/UploadImageTab';
import type { BlogImage } from '@/src/types/blog';

interface ImageSelectorProps {
  blogId: number | null;
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
    // 섬네일 이미지 업로드
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
    // try {
    //   const response = await uploadBlogImage(blogId, formData);
    //   if (response.ok) {
    //     showToast('썸네일이 성공적으로 업로드되었습니다!', 'success');
    //   } else {
    //     // 상태코드별 메시지
    //     if (response.status === 401) {
    //       showToast('로그인이 필요합니다. 다시 로그인해주세요.', 'error');
    //     } else if (response.status === 403) {
    //       showToast('접근 권한이 없습니다.', 'error');
    //     } else if (response.status === 404) {
    //       showToast('블로그를 찾을 수 없습니다.', 'error');
    //     } else if (response.status >= 500) {
    //       showToast('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    //     } else {
    //       showToast('업로드에 실패했습니다.', 'error');
    //     }
    //   }
    // } catch (error) {
    //   showToast('네트워크 오류가 발생했습니다.', 'error');
    //   console.error('업로드 중 오류 발생:', error);
    // }
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

      {/* 크롭 모달 */}
      {isCropping && croppingImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setIsCropping(false);
            setCroppingImage(null);
          }}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
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
        </div>
      )}

      <div className="w-full space-y-4">
        {/* 블로그 카드 스타일 미리보기 */}
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start gap-4">
            {/* 썸네일 */}
            <div className="flex-shrink-0">
              {selectedImage ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={selectedImage}
                    alt="선택된 썸네일"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-[10px] text-slate-400">
                  썸네일 없음
                </div>
              )}
            </div>

            {/* 오른쪽 내용 */}
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">썸네일 이미지 선택하기</h3>
                <p className="mt-1 text-xs text-slate-500">
                  아래 탭에서 이미지를 선택하거나 업로드하세요
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedImage && (
                  <>
                    <button
                      onClick={() => {
                        setCroppingImage(originalImage);
                        setIsCropping(true);
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50"
                    >
                      자르기
                    </button>
                    {/* <button
                      onClick={handleSubmit}
                      className="rounded-lg bg-[#2979FF] px-4 py-1.5 text-xs text-white shadow-sm transition hover:opacity-90"
                    >
                      적용하기
                    </button> */}
                  </>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* 탭 메뉴 */}
        <div className="flex w-full items-center gap-1 rounded-full bg-slate-100 p-1 text-xs">
          {[
            { key: 'upload', label: '이미지 업로드' },
            { key: 'blog', label: '블로그 본문 이미지' },
            { key: 'unsplash', label: '무료 이미지' },
            { key: 'google', label: '구글 검색 이미지' },
          ].map((tab) => {
            const isActive = selectedTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTab(tab.key)}
                className={[
                  'flex-1 rounded-full px-3 py-1.5 font-medium transition',
                  isActive
                    ? 'bg-white text-[#2979FF] shadow-sm'
                    : 'text-slate-500 hover:text-[#2979FF]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
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
        </div>
      </div>
    </>
  );
}
