'use client';

import { AiGenerateSingleResponse, generateAiContent } from '@/src/api/aiApi';
import { fetchBlogDetail } from '@/src/api/blogDetail';
import { showGlobalToast } from '@/src/lib/toastStore';
import React, { useEffect, useState } from 'react';
import { createDraft, deleteDraft, DraftResponse, getDraft, getDrafts } from '../api';
import DraftManagerModal from '../DraftManagerModal';
import { useFreeImageModal } from '../hooks/useFreeImageModal';
import { useHashtag } from '../hooks/useHashtag';
import { useShorlogCreate } from '../hooks/useShorlogCreate';
import { MAX_FILES } from '../types';
import ContentComposeStep from './ContentComposeStep';
import FreeImageSelectModal from './FreeImageSelectModal';
import ImageEditStep from './ImageEditStep';
import ShorlogConnectBlogModal from './ShorlogConnectBlogModal';
import ThumbnailSelectStep from './ThumbnailSelectStep';
import WizardHeader from './WizardHeader';

interface ShorlogCreateWizardProps {
  blogId?: number | null;
}

export default function ShorlogCreateWizard({ blogId }: ShorlogCreateWizardProps) {
  const [content, setContent] = useState('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [drafts, setDrafts] = useState<DraftResponse[]>([]);
  const [isDraftLoading, setIsDraftLoading] = useState(false);

  // 커스텀 훅 사용
  const shorlogCreate = useShorlogCreate();
  const hashtag = useHashtag();
  const freeImage = useFreeImageModal();

  // 페이지 진입 시 임시저장 조회
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const draftList = await getDrafts();
      setDrafts(draftList);

      if (draftList.length > 0) {
        setShowDraftModal(true);
      }
    } catch (error) {
      showGlobalToast('임시저장 목록을 불러오는데 실패했습니다.', 'error');
    }
  };

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

  const handleSaveDraft = async () => {
    try {
      setIsDraftLoading(true);

      if (shorlogCreate.images.length === 0) {
        showGlobalToast('최소 1개의 이미지가 필요합니다.', 'warning');
        setIsDraftLoading(false);
        return;
      }

      if (drafts.length >= 5) {
        showGlobalToast(
          '임시저장이 5개로 가득 찼어요. 기존 임시저장을 삭제한 후 다시 시도해주세요.',
          'warning',
        );
        setIsDraftLoading(false);
        setShowDraftModal(true);
        return;
      }

      const uploadedImages = await shorlogCreate.uploadImages();
      if (!uploadedImages || uploadedImages.length === 0) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const imageIds = uploadedImages.map((img) => img.id);

      await createDraft({
        content: content || '',
        imageIds,
        hashtags: hashtag.hashtags,
      });

      showGlobalToast('임시저장이 완료되었어요!', 'success');
      await loadDrafts();
    } catch (error) {
      showGlobalToast(error instanceof Error ? error.message : '임시저장에 실패했어요.', 'error');
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleLoadDraft = async (draftId: number) => {
    try {
      setIsDraftLoading(true);
      const draft = await getDraft(draftId);

      setContent(draft.content || '');
      hashtag.setHashtags(draft.hashtags || []);

      if (draft.thumbnailUrls && draft.thumbnailUrls.length > 0) {
        const initialImages = draft.thumbnailUrls.map((url, index) => ({
          id: `existing-${index}`,
          sourceType: 'URL' as const,
          previewUrl: url,
          remoteUrl: url,
          aspectRatio: 'ORIGINAL' as const,
        }));
        shorlogCreate.setImages(initialImages);
        shorlogCreate.goToStep(2);
      }

      showGlobalToast('임시저장 내용을 불러왔어요!', 'success');
      setShowDraftModal(false);
    } catch (error) {
      showGlobalToast(error instanceof Error ? error.message : '불러오기에 실패했어요.', 'error');
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: number) => {
    if (!confirm('이 임시저장을 삭제하시겠어요?')) {
      return;
    }

    try {
      setIsDraftLoading(true);
      await deleteDraft(draftId);
      showGlobalToast('임시저장을 삭제했습니다.', 'success');
      await loadDrafts();
    } catch (error) {
      showGlobalToast(error instanceof Error ? error.message : '삭제에 실패했어요.', 'error');
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleAiHashtagClick = async () => {
    const result = await hashtag.handleAiHashtagClick(content);
    if (result.error) {
      showGlobalToast(result.error, 'warning');
    }
  };

  const [isBlogConverting, setIsBlogConverting] = useState(false);

  const handleBlogToShorlogClick = async () => {
    if (!blogId) {
      showGlobalToast('연결된 블로그가 없습니다.', 'error');
      return;
    }

    if (isBlogConverting) return;

    try {
      setIsBlogConverting(true);

      const blogDetail = await fetchBlogDetail(blogId);

      if (!blogDetail.content || !blogDetail.content.trim()) {
        showGlobalToast('블로그 내용이 없어서 요약할 수 없습니다.', 'warning');
        return;
      }

      const aiResponse = await generateAiContent({
        mode: 'summary',
        contentType: 'shorlog',
        content: blogDetail.content,
      });

      if (!aiResponse.resultCode || !aiResponse.resultCode.startsWith('200')) {
        throw new Error(`AI 서버 오류: ${aiResponse.msg || '알 수 없는 오류'}`);
      }

      if (!aiResponse.data) {
        throw new Error('AI 응답에 데이터가 없습니다.');
      }

      const singleResponse = aiResponse as AiGenerateSingleResponse;
      const summaryResult = singleResponse.data.result;

      if (!summaryResult || summaryResult.trim() === '') {
        throw new Error('AI가 빈 요약을 반환했습니다.');
      }

      setContent(summaryResult.trim());
      showGlobalToast('블로그 내용을 숏로그로 요약했어요!', 'success');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '블로그를 숏로그로 변환하는데 실패했습니다.';
      showGlobalToast(errorMessage, 'error');
    } finally {
      setIsBlogConverting(false);
    }
  };

  // Unsplash 이미지 선택
  const handleUnsplashImagesSelect = async (selectedUrls: string[]) => {
    await freeImage.handleUnsplashImagesSelect(
      selectedUrls,
      shorlogCreate.images,
      shorlogCreate.setImages,
      shorlogCreate.step,
      (step) => shorlogCreate.goToStep(step),
      shorlogCreate.setSelectedIndex,
    );
  };

  // Pixabay 이미지 선택
  const handlePixabayImagesSelect = async (selectedUrls: string[]) => {
    shorlogCreate.setError(null);
    await freeImage.handlePixabayImagesSelect(
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
            onPixabayPhoto={freeImage.handlePixabayPhoto}
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
            onBlogToShorlogClick={blogId ? handleBlogToShorlogClick : undefined}
            isBlogConverting={isBlogConverting}
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

        {freeImage.showPixabayModal && (
          <FreeImageSelectModal
            apiType="pixabay"
            onSelect={handlePixabayImagesSelect}
            onClose={() => freeImage.setShowPixabayModal(false)}
            maxSelect={MAX_FILES - shorlogCreate.images.length}
          />
        )}

        {/* 숏로그 생성 완료 후 블로그 연결 모달 */}
        <ShorlogConnectBlogModal
          isOpen={shorlogCreate.showBlogConnectModal}
          shorlogId={Number(shorlogCreate.createdShorlogId)}
          recentBlogs={shorlogCreate.recentBlogs}
          onSelectBlog={shorlogCreate.handleSelectBlog}
          onCreateNewBlog={shorlogCreate.handleCreateNewBlog}
          onSkip={shorlogCreate.handleSkipConnection}
        />

        {/* 임시저장 관리 모달 */}
        <DraftManagerModal
          isOpen={showDraftModal}
          drafts={drafts}
          onClose={() => setShowDraftModal(false)}
          onLoad={handleLoadDraft}
          onDelete={handleDeleteDraft}
          isLoading={isDraftLoading}
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
