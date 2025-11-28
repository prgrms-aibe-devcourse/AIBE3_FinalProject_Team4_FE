'use client';

import React, { useState } from 'react';
import { MAX_FILES } from '../types';
import WizardHeader from './WizardHeader';
import ThumbnailSelectStep from './ThumbnailSelectStep';
import ImageEditStep from './ImageEditStep';
import ContentComposeStep from './ContentComposeStep';
import FreeImageSelectModal from './FreeImageSelectModal';
import { useShorlogCreate } from '../hooks/useShorlogCreate';
import { useHashtag } from '../hooks/useHashtag';
import { useFreeImageModal } from '../hooks/useFreeImageModal';

export default function ShorlogCreateWizard() {
  const [content, setContent] = useState('');
  const DRAFT_KEY = 'shorlog:create:draft';

  // 커스텀 훅 사용
  const shorlogCreate = useShorlogCreate();
  const hashtag = useHashtag();
  const freeImage = useFreeImageModal();

  // 파일 입력 핸들러
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    shorlogCreate.addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  // Step 1 -> Step 2
  const handleNextFromStep1 = () => {
    if (!shorlogCreate.images.length) {
      shorlogCreate.setError('최소 1개의 이미지를 선택해주세요.');
      return;
    }
    shorlogCreate.goToStep(2);
  };

  // Submit
  const handleSubmit = async () => {
    await shorlogCreate.handleSubmit(content, hashtag.hashtags);
  };

  // 임시 저장
  const handleSaveDraft = () => {
    if (typeof window === 'undefined') return;
    const draft = { content, hashtags: hashtag.hashtags };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    alert('현재 내용을 임시 저장했어요. (localStorage)');
  };

  // AI 해시태그
  const handleAiHashtagClick = async () => {
    const result = await hashtag.handleAiHashtagClick(content);
    if (result.error) {
      shorlogCreate.setError(result.error);
    }
  };

  // Unsplash 이미지 선택
  const handleUnsplashImagesSelect = async (selectedUrls: string[]) => {
    shorlogCreate.setError(null);
    await freeImage.handleUnsplashImagesSelect(
      selectedUrls,
      shorlogCreate.images,
      shorlogCreate.setImages,
      shorlogCreate.step,
      (step) => shorlogCreate.goToStep(step),
      shorlogCreate.setSelectedIndex,
    );
  };

  // Google 이미지 선택
  const handleGoogleImagesSelect = async (selectedUrls: string[]) => {
    shorlogCreate.setError(null);
    await freeImage.handleGoogleImagesSelect(
      selectedUrls,
      shorlogCreate.images,
      shorlogCreate.setImages,
      shorlogCreate.step,
      (step) => shorlogCreate.goToStep(step),
      shorlogCreate.setSelectedIndex,
    );
  };

  // --------- 렌더 ---------
  return (
    <div className="flex h-full w-full flex-col">
      <WizardHeader step={shorlogCreate.step} title={shorlogCreate.currentStepTitle} />

      <div className="relative flex-1 overflow-hidden px-4 pb-4 pt-2 md:px-6 md:pt-3 lg:px-8">
        {shorlogCreate.step === 1 && (
          <ThumbnailSelectStep
            images={shorlogCreate.images}
            onFileInputChange={handleFileInputChange}
            onAddFiles={shorlogCreate.addFiles}
            onNext={handleNextFromStep1}
            onUnsplashPhoto={freeImage.handleUnsplashPhoto}
            onGooglePhoto={freeImage.handleGooglePhoto}
          />
        )}

        {shorlogCreate.step === 2 && (
          <ImageEditStep
            images={shorlogCreate.images}
            selectedIndex={shorlogCreate.safeSelectedIndex}
            setSelectedIndex={shorlogCreate.setSelectedIndex}
            onFileInputChange={handleFileInputChange}
            onChangeAspectRatio={shorlogCreate.changeAspectRatio}
            onDeleteImage={shorlogCreate.deleteImage}
            onReorderImages={shorlogCreate.reorderImages}
            onPrev={() => shorlogCreate.goToStep(1)}
            onNext={shorlogCreate.handleNextFromStep2}
            isUploading={shorlogCreate.isUploading}
          />
        )}

        {shorlogCreate.step === 3 && (
          <ContentComposeStep
            images={shorlogCreate.sliderImages}
            content={content}
            setContent={setContent}
            hashtags={hashtag.hashtags}
            hashtagInput={hashtag.hashtagInput}
            setHashtagInput={hashtag.setHashtagInput}
            onHashtagKeyDown={hashtag.handleHashtagKeyDown}
            addHashtagFromInput={hashtag.addHashtagFromInput}
            removeHashtag={hashtag.removeHashtag}
            onAiHashtagClick={handleAiHashtagClick}
            isAiLoading={hashtag.isAiLoading}
            onPrev={() => shorlogCreate.goToStep(2)}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            isSubmitting={shorlogCreate.isSubmitting}
          />
        )}

        {freeImage.showUnsplashModal && (
          <FreeImageSelectModal
            apiType="unsplash"
            onSelect={handleUnsplashImagesSelect}
            onClose={() => freeImage.setShowUnsplashModal(false)}
            maxSelect={MAX_FILES - shorlogCreate.images.length}
          />
        )}

        {freeImage.showGoogleModal && (
          <FreeImageSelectModal
            apiType="google"
            onSelect={handleGoogleImagesSelect}
            onClose={() => freeImage.setShowGoogleModal(false)}
            maxSelect={MAX_FILES - shorlogCreate.images.length}
          />
        )}

        {shorlogCreate.error && (
          <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-red-500 md:left-6 lg:left-8">
            {shorlogCreate.error}
          </p>
        )}
      </div>
    </div>
  );
}
