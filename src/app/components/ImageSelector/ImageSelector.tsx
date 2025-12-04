'use client';

import { uploadBlogImage } from '@/src/api/blogImageApi';
import Toast from '@/src/app/components/ImageSelector/Toast';
import { handleApiError } from '@/src/lib/handleApiError';
import type { BlogFileDto, BlogImage, BlogMediaUploadResponse, RsData } from '@/src/types/blog';
import { Crop } from 'lucide-react';
import { SetStateAction, useState } from 'react';
import Cropper from './Cropper';
import BlogImageTab from './tabs/BlogImageTab';
import FreeImageTab from './tabs/FreeImageTab';
import UploadTab from './tabs/UploadImageTab';

interface ImageSelectorProps {
  blogId: number | null;
  blogImages: BlogImage[];
  thumbnailUrl: string | null;
  blogContent?: string;
  onChangeImages: (images: BlogFileDto[]) => void;
  onChangeThumbnail: (url: string | null) => void;
  ensureDraft: () => Promise<number>;
}

export default function ImageSelector({
  blogId,
  blogImages,
  thumbnailUrl,
  blogContent,
  onChangeImages,
  onChangeThumbnail,
  ensureDraft,
}: ImageSelectorProps) {
  // UI 탭 상태
  const [selectedTab, setSelectedTab] = useState('upload');
  // 크롭 모달 활성화 여부
  const [isCropping, setIsCropping] = useState(false);

  // 이미지 선택 및 편집 관련 상태
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // 현재 선택된 이미지 URL
  const [originalImage, setOriginalImage] = useState<string | null>(null); // 원본 이미지 URL
  const [croppingImage, setCroppingImage] = useState<string | null>(null); // 크롭 중인 이미지 URL
  const [lastAspect, setLastAspect] = useState<string | null>(null); // 마지막으로 사용한 크롭 비율

  // 업로드 파일 관련 상태
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // 업로드된 파일 객체
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null); // 업로드된 파일의 미리보기 URL
  const [imageSourceType, setImageSourceType] = useState<'file' | 'url'>('file'); // 이미지 소스 타입

  // 무료 이미지 검색 키워드 상태
  const [unsplashSearchKeyword, setUnsplashSearchKeyword] = useState('');
  const [pixabaySearchKeyword, setPixabaySearchKeyword] = useState('');

  // 토스트
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      showToast('먼저 이미지를 선택해 주세요.', 'warning');
      return;
    }

    const formData = new FormData();

    if (imageSourceType === 'file' && uploadedFile) {
      formData.append('files', uploadedFile);
    } else if (imageSourceType === 'url' && originalImage) {
      formData.append('url', originalImage);
    } else {
      showToast('업로드할 이미지가 없습니다.', 'warning');
      return;
    }

    formData.append('type', 'THUMBNAIL');

    // lastAspect가 null이면 '원본'을 기본값으로 사용
    const aspectRatioMap: Record<string, string> = {
      원본: 'original',
      '1:1': '1:1',
      '4:5': '4:5',
      '16:9': '16:9',
    };
    const aspectKey = lastAspect ?? '원본';
    formData.append('aspectRatios', aspectRatioMap[aspectKey] || 'original');

    try {
      const validBlogId = blogId ?? (await ensureDraft());
      // 1) Response 받기
      const res = await uploadBlogImage(validBlogId, formData);

      // 2) 상태코드 체크
      if (!res.ok) {
        if (res.status === 401) {
          showToast('로그인이 필요합니다. 다시 로그인해주세요.', 'error');
        } else if (res.status === 403) {
          showToast('접근 권한이 없습니다.', 'error');
        } else if (res.status === 404) {
          showToast('블로그를 찾을 수 없습니다.', 'error');
        } else if (res.status >= 500) {
          showToast('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        } else {
          showToast('업로드에 실패했습니다.', 'error');
        }
        return;
      }

      // 3) JSON 파싱해서 RsData 구조로 해석
      const rs: RsData<BlogMediaUploadResponse> = await res.json();
      const dto = rs.data;
      if (!dto) {
        showToast('업로드 응답이 올바르지 않습니다.', 'error');
        return;
      }

      // 4) 섬네일 URL을 부모에 반영
      onChangeThumbnail(dto.url);
      // 필요하면 이미지 리스트에도 추가
      const newImage: BlogFileDto = {
        imageId: dto.imageId,
        url: dto.url,
        sortOrder: blogImages.length,
        contentType: 'IMAGE',
      };
      onChangeImages([...blogImages, newImage]);

      // 로컬 선택 상태도 업데이트
      setUploadedFile(null);
      setUploadedFileUrl(null);
      setSelectedImage(null);
      setOriginalImage(null);
      setCroppingImage(null);
      setImageSourceType('file');

      showToast('썸네일이 성공적으로 업로드되었습니다!', 'success');
    } catch (error) {
      console.error('업로드 중 오류 발생:', error);
      handleApiError(error);
    }
  };

  return (
    <>
      {/* 토스트 메시지 */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* 크롭 모달 */}
      {isCropping && croppingImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            setIsCropping(false);
            setCroppingImage(null);
          }}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl"
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
            {/* 섬네일 */}
            <div className="flex-shrink-0">
              {selectedImage || thumbnailUrl ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={selectedImage ?? thumbnailUrl ?? ''}
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
                  제목과 내용 입력 후, 아래 탭에서 이미지를 선택하거나 업로드하고 등록하기 버튼을
                  누르세요.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCroppingImage(originalImage);
                    setIsCropping(true);
                  }}
                  disabled={!selectedImage}
                  className={`
                    rounded-xl border px-3 py-1.5 text-xs transition flex items-center gap-1
                    ${
                      selectedImage
                        ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  <Crop className="w-4 h-4 mr-1" />
                  자르기
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedImage}
                  className={`
                    rounded-xl px-3 py-1.5 text-xs text-white shadow-sm transition
                    ${
                      selectedImage
                        ? 'bg-[#2979FF] hover:opacity-90'
                        : 'bg-slate-300 cursor-not-allowed opacity-60'
                    }
                      `}
                >
                  썸네일 등록하기
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* 탭 메뉴 */}
        <div className="flex w-full items-center gap-1 rounded-full bg-slate-100 p-1 text-xs">
          {[
            { key: 'upload', label: '이미지 업로드' },
            { key: 'blog', label: '본문 이미지' },
            { key: 'unsplash', label: '무료 이미지 (Unsplash)' },
            { key: 'pixabay', label: '무료 이미지 (Pixabay)' },
          ].map((tab) => {
            const isActive = selectedTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTab(tab.key)}
                className={[
                  'flex-1 rounded-full px-3 py-1.5 font-medium transition truncate',
                  isActive
                    ? 'bg-white text-slate-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
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
              originalImage={originalImage}
              setUploadedFile={setUploadedFile}
              setUploadedFileUrl={setUploadedFileUrl}
              setImageSourceType={setImageSourceType}
              onSelect={(url: string | null) => {
                setSelectedImage(url);
                setOriginalImage(url);
                setCroppingImage(url);
                setLastAspect(null);
              }}
              showToast={showToast}
            />
          )}

          {selectedTab === 'blog' && (
            <BlogImageTab
              images={blogImages}
              originalImage={originalImage}
              onSelect={(url: string | null) => {
                setImageSourceType('url');
                setSelectedImage(url);
                setOriginalImage(url);
                setCroppingImage(url);
                setLastAspect(null);
              }}
            />
          )}

          {selectedTab === 'unsplash' && (
            <FreeImageTab
              blogContent={blogContent}
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

          {selectedTab === 'pixabay' && (
            <FreeImageTab
              blogContent={blogContent}
              searchKeyword={pixabaySearchKeyword}
              onSearchKeywordChange={setPixabaySearchKeyword}
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
        </div>
      </div>
    </>
  );
}
