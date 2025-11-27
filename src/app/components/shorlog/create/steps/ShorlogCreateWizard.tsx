'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  LocalImage,
  MAX_CONTENT_LENGTH,
  Step,
  MAX_FILES,
  UploadImageResponse,
  AspectRatio,
} from '../types';
import { uploadImagesBatchMock, createShorlogMock } from '../api';
import WizardHeader from './WizardHeader';
import ThumbnailSelectStep from './ThumbnailSelectStep';
import ImageEditStep from './ImageEditStep';
import ContentComposeStep from './ContentComposeStep';
import BlogImageSelectModal from './BlogImageSelectModal';

export default function ShorlogCreateWizard() {
  const [images, setImages] = useState<LocalImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadImageResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<Step>(1);

  const searchParams = useSearchParams();
  const blogId = searchParams.get('blogId');

  const [selectedIndex, setSelectedIndex] = useState(0);

  // 콘텐츠 / 해시태그
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');

  // 블로그 이미지 선택 모달
  const [showBlogImageModal, setShowBlogImageModal] = useState(false);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DRAFT_KEY = 'shorlog:create:draft';

  // --------- 파생 값 ---------
  const currentStepTitle = useMemo(() => {
    if (step === 1) return '섬네일 선택';
    if (step === 2) return '사진 편집';
    return '숏로그 작성';
  }, [step]);

  // 이미지 슬라이더에 넘길 URL 배열
  const sliderImages = useMemo(() => {
    if (uploadedImages.length > 0) {
      return uploadedImages.map((img) => img.imageUrl);
    }
    return images.map((img) => img.previewUrl);
  }, [images, uploadedImages]);

  const safeSelectedIndex = Math.min(selectedIndex, Math.max(images.length - 1, 0));

  // --------- 파일 추가 로직 (프론트 검증 최소화) ---------
  const addFiles = useCallback(
    (files: File[]) => {
      setError(null);
      if (!files.length) return;

      const currentCount = images.length;
      const remainingSlots = MAX_FILES - currentCount;
      const slice = files.slice(0, remainingSlots);
      const next: LocalImage[] = [];

      for (const file of slice) {
        const id = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);

        next.push({
          id,
          file,
          sourceType: 'FILE',
          previewUrl,
          aspectRatio: 'ORIGINAL',
          originalFilename: file.name,
        });
      }

      if (!next.length) return;
      setImages((prev) => [...prev, ...next]);

      // 첫 업로드면 바로 2단계로 이동
      if (step === 1 && currentCount === 0 && next.length > 0) {
        setStep(2);
        setSelectedIndex(0);
      }
    },
    [images.length, step],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const goToStep = (next: Step) => {
    setError(null);
    setStep(next);
  };

  // --------- Step 전환 ---------
  const handleNextFromStep1 = () => {
    if (!images.length) {
      setError('최소 1개의 이미지를 선택해주세요.');
      return;
    }
    goToStep(2);
  };

  const handleNextFromStep2 = async () => {
    if (!images.length) {
      setError('편집할 이미지가 없습니다.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 실제 구현 시: /api/v1/shorlog/images/batch
      const uploaded = await uploadImagesBatchMock(images);
      setUploadedImages(uploaded);
      goToStep(3);
    } catch (e) {
      console.error(e);
      setError('이미지 업로드 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();

    if (!trimmed) {
      setError('내용을 입력해주세요.');
      return;
    }
    // ✅ 200자 미만 경고/제한 제거 (길이 최소 검증 없음)
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      setError(`내용은 최대 ${MAX_CONTENT_LENGTH}자까지 작성할 수 있어요.`);
      return;
    }
    if (!uploadedImages.length) {
      setError('이미지를 먼저 업로드해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 실제 구현 시: POST /api/v1/shorlog
      await createShorlogMock({
        content: trimmed,
        imageIds: uploadedImages.map((img) => img.id),
        hashtags,
      });
      alert('숏로그가 임시로 생성되었다고 가정합니다. (mock)');
    } catch (e) {
      console.error(e);
      setError('숏로그 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------- 임시 저장 (localStorage) ---------
  const handleSaveDraft = () => {
    if (typeof window === 'undefined') return;
    const draft = { content, hashtags };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    alert('현재 내용을 임시 저장했어요. (localStorage)');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { content?: string; hashtags?: string[] };
      if (parsed.content) setContent(parsed.content);
      if (parsed.hashtags) setHashtags(parsed.hashtags);
    } catch {
      // ignore
    }
  }, []);

  // --------- 이미지 편집 로직 ---------
  const changeAspectRatio = (id: string, ratio: AspectRatio) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, aspectRatio: ratio } : img)),
    );
  };

  const deleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setSelectedIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
    setSelectedIndex(toIndex);
  };

  // --------- 해시태그 로직 ---------
  const addHashtagFromInput = () => {
    let value = hashtagInput.trim();
    if (!value) return;

    if (value.startsWith('#')) value = value.slice(1);
    if (!value) return;

    if (hashtags.includes(value)) {
      setHashtagInput('');
      return;
    }
    if (hashtags.length >= 10) {
      setError('해시태그는 최대 10개까지 입력할 수 있어요.');
      return;
    }

    setHashtags((prev) => [...prev, value]);
    setHashtagInput('');
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addHashtagFromInput();
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAiHashtagClick = async () => {
    if (!content.trim()) {
      setError('AI 해시태그 추천을 사용하려면 내용이 필요해요.');
      return;
    }

    setIsAiLoading(true);
    setError(null);

    try {
      // 실제 구현 시:
      // POST /api/v1/ais  { mode: "hashtag", content }
      const mockSuggested = ['개발', '일상', '텍톡'];
      const merged = [...hashtags];
      mockSuggested.forEach((tag) => {
        if (merged.length < 10 && !merged.includes(tag)) merged.push(tag);
      });
      setHashtags(merged);
    } catch (e) {
      console.error(e);
      setError('AI 해시태그 추천 호출 중 오류가 발생했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // --------- 무료 사진 키워드 (AI) ---------
  const handleAiKeywordForUnsplash = async () => {
    // 실제 구현 시:
    // POST /api/v1/ais  { mode: "keywordForUnsplash" | "keywordForGoogle", content }
    alert('무료 사진 키워드 추천 API 자리입니다. (mock)');
  };

  // --------- 블로그 이미지 선택 ---------
  const handleBlogPhotoClick = () => {
    // TODO: 실제 구현 시 blogId 필수 체크 활성화
    // if (!blogId) {
    //   setError('블로그 ID가 없습니다.');
    //   return;
    // }
    setShowBlogImageModal(true);
  };

  const handleBlogImagesSelect = async (selectedUrls: string[]) => {
    setError(null);

    const currentCount = images.length;
    const remainingSlots = MAX_FILES - currentCount;
    const urlsToAdd = selectedUrls.slice(0, remainingSlots);

    const newImages: LocalImage[] = await Promise.all(
      urlsToAdd.map(async (url) => {
        const id = crypto.randomUUID();
        return {
          id,
          sourceType: 'URL' as const,
          previewUrl: url,
          remoteUrl: url,
          aspectRatio: 'ORIGINAL' as const,
          originalFilename: url.split('/').pop() || 'blog_image',
        };
      })
    );

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);

      // 첫 업로드면 바로 2단계로 이동
      if (step === 1 && currentCount === 0) {
        setStep(2);
        setSelectedIndex(0);
      }
    }
  };

  // --------- 렌더 ---------
  return (
    <div className="flex h-full w-full flex-col">
      <WizardHeader step={step} title={currentStepTitle} />

      <div className="relative flex-1 overflow-hidden px-4 pb-4 pt-2 md:px-6 md:pt-3 lg:px-8">
        {step === 1 && (
          <ThumbnailSelectStep
            images={images}
            onFileInputChange={handleFileInputChange}
            onAddFiles={addFiles}
            onNext={handleNextFromStep1}
            onAiFreePhoto={handleAiKeywordForUnsplash}
            onBlogPhotoClick={handleBlogPhotoClick}
            hasBlogId={!!blogId}
          />
        )}

        {step === 2 && (
          <ImageEditStep
            images={images}
            selectedIndex={safeSelectedIndex}
            setSelectedIndex={setSelectedIndex}
            onFileInputChange={handleFileInputChange}
            onChangeAspectRatio={changeAspectRatio}
            onDeleteImage={deleteImage}
            onReorderImages={reorderImages}
            onPrev={() => goToStep(1)}
            onNext={handleNextFromStep2}
            isUploading={isUploading}
          />
        )}

        {step === 3 && (
          <ContentComposeStep
            images={sliderImages}
            content={content}
            setContent={setContent}
            hashtags={hashtags}
            hashtagInput={hashtagInput}
            setHashtagInput={setHashtagInput}
            onHashtagKeyDown={handleHashtagKeyDown}
            addHashtagFromInput={addHashtagFromInput}
            removeHashtag={removeHashtag}
            onAiHashtagClick={handleAiHashtagClick}
            isAiLoading={isAiLoading}
            onPrev={() => goToStep(2)}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {showBlogImageModal && blogId && (
          <BlogImageSelectModal
            blogId={blogId}
            onSelect={handleBlogImagesSelect}
            onClose={() => setShowBlogImageModal(false)}
            maxSelect={MAX_FILES - images.length}
          />
        )}

        {error && (
          <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-red-500 md:left-6 lg:left-8">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
