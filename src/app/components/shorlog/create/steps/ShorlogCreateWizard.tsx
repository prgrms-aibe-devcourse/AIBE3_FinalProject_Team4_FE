'use client';

import React, { useState } from 'react';
import { MAX_FILES } from '../types';
import WizardHeader from './WizardHeader';
import ThumbnailSelectStep from './ThumbnailSelectStep';
import ImageEditStep from './ImageEditStep';
import ContentComposeStep from './ContentComposeStep';
import FreeImageSelectModal from './FreeImageSelectModal';
import ShorlogConnectBlogModal from './ShorlogConnectBlogModal';
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

  // 블로그 → 숏로그 변환
  const handleBlogToShorlogClick = async () => {
    // TODO: 블로그 내용 기반 요약 생성 기능 구현
    // 
    // [조건] 블로그 생성 후 숏로그 생성 시에만 이 버튼이 보여야 함
    // - URL에서 blogId 파라미터 확인 (예: /shorlog/create?blogId=123)
    // - blogId가 있을 때만 onBlogToShorlogClick prop 전달
    //
    // [구현 순서]
    // 1. blogId로 해당 블로그 내용 조회
    //    GET /api/v1/blogs/{blogId}
    //
    // 2. 블로그 내용을 AI로 요약 (200-800자)
    //    POST /api/v1/ais
    //
    // 3. 요약 결과를 content에 설정
    //    setContent(result.data)
    //
    // 4. 사용자에게 성공 알림
    //    "블로그 내용을 숏로그로 요약했어요!"

    console.log('블로그 → 숏로그 변환 기능 (구현 예정)');
    alert('블로그 → 숏로그 변환 기능은 곧 추가됩니다!');
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
            onBlogToShorlogClick={handleBlogToShorlogClick}
            isBlogConverting={false}
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

        {/* 숏로그 생성 완료 후 블로그 연결 모달 */}
        <ShorlogConnectBlogModal
          isOpen={shorlogCreate.showBlogConnectModal}
          recentBlogs={shorlogCreate.recentBlogs}
          onSelectBlog={shorlogCreate.handleSelectBlog}
          onCreateNewBlog={shorlogCreate.handleCreateNewBlog}
          onSkip={shorlogCreate.handleSkipConnection}
        />

        {shorlogCreate.error && (
          <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-red-500 md:left-6 lg:left-8">
            {shorlogCreate.error}
          </p>
        )}
      </div>
    </div>
  );
}
