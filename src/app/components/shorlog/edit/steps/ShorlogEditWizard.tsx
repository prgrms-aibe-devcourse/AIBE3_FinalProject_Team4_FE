'use client';

import React, { useState } from 'react';
import { MAX_FILES } from '../../create/types';
import WizardHeader from '../../create/steps/WizardHeader';
import ThumbnailSelectStep from '../../create/steps/ThumbnailSelectStep';
import ImageEditStep from '../../create/steps/ImageEditStep';
import ContentComposeStep from '../../create/steps/ContentComposeStep';
import FreeImageSelectModal from '../../create/steps/FreeImageSelectModal';
import ShorlogConnectBlogModal from '../../create/steps/ShorlogConnectBlogModal';
import { useShorlogEdit } from '../hooks/useShorlogEdit';
import { useHashtag } from '../../create/hooks/useHashtag';
import { useFreeImageModal } from '../../create/hooks/useFreeImageModal';
import type { ShorlogDetail } from '../../detail/types';

interface ShorlogEditWizardProps {
  shorlogId: string;
  initialData: ShorlogDetail;
}

export default function ShorlogEditWizard({ shorlogId, initialData }: ShorlogEditWizardProps) {
  const [content, setContent] = useState(initialData.content);
  const [linkedBlogTitle, setLinkedBlogTitle] = useState<string | undefined>();

  // 커스텀 훅 사용
  const shorlogEdit = useShorlogEdit(shorlogId, initialData);
  const hashtag = useHashtag(initialData.hashtags);
  const freeImage = useFreeImageModal();

  // 파일 입력 핸들러
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    shorlogEdit.addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  // Step 1 -> Step 2
  const handleNextFromStep1 = () => {
    if (!shorlogEdit.images.length) {
      shorlogEdit.setError('최소 1개의 이미지를 선택해주세요.');
      return;
    }
    shorlogEdit.goToStep(2);
  };

  // Submit
  const handleSubmit = async () => {
    await shorlogEdit.handleSubmit(content, hashtag.hashtags);
  };

  // AI 해시태그
  const handleAiHashtagClick = async () => {
    const result = await hashtag.handleAiHashtagClick(content);
    if (result.error) {
      shorlogEdit.setError(result.error);
    }
  };

  // Unsplash 이미지 선택
  const handleUnsplashImagesSelect = async (selectedUrls: string[]) => {
    shorlogEdit.setError(null);
    await freeImage.handleUnsplashImagesSelect(
      selectedUrls,
      shorlogEdit.images,
      shorlogEdit.setImages,
      shorlogEdit.step,
      (step) => shorlogEdit.goToStep(step),
      shorlogEdit.setSelectedIndex,
    );
  };

  // Google 이미지 선택
  const handleGoogleImagesSelect = async (selectedUrls: string[]) => {
    shorlogEdit.setError(null);
    await freeImage.handleGoogleImagesSelect(
      selectedUrls,
      shorlogEdit.images,
      shorlogEdit.setImages,
      shorlogEdit.step,
      (step) => shorlogEdit.goToStep(step),
      shorlogEdit.setSelectedIndex,
    );
  };

  // 블로그 연결 선택
  const handleSelectBlog = async (blogId: number) => {
    await shorlogEdit.handleConnectBlog(blogId);
    const blog = shorlogEdit.recentBlogs.find(b => b.id === blogId);
    if (blog) {
      setLinkedBlogTitle(blog.title);
    }
  };

  // --------- 렌더 ---------
  return (
    <div className="flex h-full w-full flex-col">
      <WizardHeader step={shorlogEdit.step} title={shorlogEdit.currentStepTitle} />

      <div className="relative flex-1 overflow-hidden px-4 pb-4 pt-2 md:px-6 md:pt-3 lg:px-8">
        {shorlogEdit.step === 1 && (
          <ThumbnailSelectStep
            images={shorlogEdit.images}
            onFileInputChange={handleFileInputChange}
            onAddFiles={shorlogEdit.addFiles}
            onNext={handleNextFromStep1}
            onUnsplashPhoto={freeImage.handleUnsplashPhoto}
            onGooglePhoto={freeImage.handleGooglePhoto}
          />
        )}

        {shorlogEdit.step === 2 && (
          <ImageEditStep
            images={shorlogEdit.images}
            selectedIndex={shorlogEdit.safeSelectedIndex}
            setSelectedIndex={shorlogEdit.setSelectedIndex}
            onFileInputChange={handleFileInputChange}
            onChangeAspectRatio={shorlogEdit.changeAspectRatio}
            onDeleteImage={shorlogEdit.deleteImage}
            onReorderImages={shorlogEdit.reorderImages}
            onPrev={() => shorlogEdit.goToStep(1)}
            onNext={shorlogEdit.handleNextFromStep2}
            isUploading={shorlogEdit.isUploading}
          />
        )}

        {shorlogEdit.step === 3 && (
          <ContentComposeStep
            images={shorlogEdit.sliderImages}
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
            onPrev={() => shorlogEdit.goToStep(2)}
            onSubmit={handleSubmit}
            isSubmitting={shorlogEdit.isSubmitting}
            isEditMode={true}
            linkedBlogId={shorlogEdit.linkedBlogId}
            linkedBlogTitle={linkedBlogTitle}
            onDisconnectBlog={shorlogEdit.handleDisconnectBlog}
            onConnectBlog={shorlogEdit.handleOpenBlogConnectModal}
          />
        )}

        {freeImage.showUnsplashModal && (
          <FreeImageSelectModal
            apiType="unsplash"
            onSelect={handleUnsplashImagesSelect}
            onClose={() => freeImage.setShowUnsplashModal(false)}
            maxSelect={MAX_FILES - shorlogEdit.images.length}
          />
        )}

        {freeImage.showGoogleModal && (
          <FreeImageSelectModal
            apiType="google"
            onSelect={handleGoogleImagesSelect}
            onClose={() => freeImage.setShowGoogleModal(false)}
            maxSelect={MAX_FILES - shorlogEdit.images.length}
          />
        )}

        {/* 블로그 연결 모달 */}
        <ShorlogConnectBlogModal
          isOpen={shorlogEdit.showBlogConnectModal}
          recentBlogs={shorlogEdit.recentBlogs}
          onSelectBlog={handleSelectBlog}
          onCreateNewBlog={() => {
            shorlogEdit.setShowBlogConnectModal(false);
            // TODO: 블로그 생성 페이지로 이동
          }}
          onSkip={() => shorlogEdit.setShowBlogConnectModal(false)}
          isEditMode={true}
        />

        {shorlogEdit.error && (
          <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-red-500 md:left-6 lg:left-8">
            {shorlogEdit.error}
          </p>
        )}
      </div>
    </div>
  );
}

