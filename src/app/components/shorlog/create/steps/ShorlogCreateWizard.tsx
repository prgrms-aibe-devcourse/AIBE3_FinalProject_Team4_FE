'use client';

import React, { useState, useEffect } from 'react';
import { MAX_FILES } from '../types';
import WizardHeader from './WizardHeader';
import ThumbnailSelectStep from './ThumbnailSelectStep';
import ImageEditStep from './ImageEditStep';
import ContentComposeStep from './ContentComposeStep';
import FreeImageSelectModal from './FreeImageSelectModal';
import ShorlogConnectBlogModal from './ShorlogConnectBlogModal';
import DraftManagerModal from '../DraftManagerModal';
import { useShorlogCreate } from '../hooks/useShorlogCreate';
import { useHashtag } from '../hooks/useHashtag';
import { useFreeImageModal } from '../hooks/useFreeImageModal';
import { getDrafts, getDraft, deleteDraft, createDraft, DraftResponse } from '../api';
import { showGlobalToast } from '@/src/lib/toastStore';
import { fetchBlogDetail } from '@/src/api/blogDetail';
import { generateAiContent, AiGenerateSingleResponse } from '@/src/api/aiApi';

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

  // 임시저장 목록 불러오기
  const loadDrafts = async () => {
    try {
      const draftList = await getDrafts();
      setDrafts(draftList);

      // 임시저장이 있으면 모달 표시
      if (draftList.length > 0) {
        setShowDraftModal(true);
      }
    } catch (error) {
      console.error('임시저장 목록 조회 실패:', error);
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

  // 임시 저장 (Step 3의 버튼)
  const handleSaveDraft = async () => {
    try {
      setIsDraftLoading(true);

      // 먼저 이미지 업로드
      if (shorlogCreate.images.length === 0) {
        showGlobalToast('최소 1개의 이미지가 필요합니다.', 'warning');
        setIsDraftLoading(false);
        return;
      }

      // 5개 제한 확인
      if (drafts.length >= 5) {
        showGlobalToast('임시저장이 5개로 가득 찼어요. 기존 임시저장을 삭제한 후 다시 시도해주세요.', 'warning');
        setIsDraftLoading(false);
        setShowDraftModal(true); // 모달 열어서 삭제할 수 있게
        return;
      }

      const uploadedImages = await shorlogCreate.uploadImages();
      if (!uploadedImages || uploadedImages.length === 0) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const imageIds = uploadedImages.map(img => img.id);

      await createDraft({
        content: content || '',
        imageIds,
        hashtags: hashtag.hashtags,
      });

      showGlobalToast('임시저장이 완료되었어요!', 'success');
      await loadDrafts();
    } catch (error) {
      console.error('임시저장 실패:', error);
      showGlobalToast(error instanceof Error ? error.message : '임시저장에 실패했어요.', 'error');
    } finally {
      setIsDraftLoading(false);
    }
  };

  // 임시저장 불러오기
  const handleLoadDraft = async (draftId: number) => {
    try {
      setIsDraftLoading(true);
      const draft = await getDraft(draftId);

      // 내용과 해시태그 복원
      setContent(draft.content || '');
      hashtag.setHashtags(draft.hashtags || []);

      // 기존 이미지를 LocalImage 형태로 변환 (모두 재업로드할 예정)
      if (draft.thumbnailUrls && draft.thumbnailUrls.length > 0) {
        const initialImages = draft.thumbnailUrls.map((url, index) => ({
          id: `existing-${index}`,
          sourceType: 'URL' as const,
          previewUrl: url,
          remoteUrl: url,
          aspectRatio: 'ORIGINAL' as const,
        }));
        shorlogCreate.setImages(initialImages);
        // Step 2로 이동 (이미지 편집 단계)
        shorlogCreate.goToStep(2);
      }

      showGlobalToast('임시저장 내용을 불러왔어요!', 'success');
      setShowDraftModal(false);
    } catch (error) {
      console.error('임시저장 불러오기 실패:', error);
      showGlobalToast(error instanceof Error ? error.message : '불러오기에 실패했어요.', 'error');
    } finally {
      setIsDraftLoading(false);
    }
  };

  // 임시저장 삭제
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
      console.error('임시저장 삭제 실패:', error);
      showGlobalToast(error instanceof Error ? error.message : '삭제에 실패했어요.', 'error');
    } finally {
      setIsDraftLoading(false);
    }
  };

  // AI 해시태그
  const handleAiHashtagClick = async () => {
    const result = await hashtag.handleAiHashtagClick(content);
    if (result.error) {
      showGlobalToast(result.error, 'warning');
    }
  };

  // 블로그 → 숏로그 변환 상태
  const [isBlogConverting, setIsBlogConverting] = useState(false);

  // 블로그 → 숏로그 변환
  const handleBlogToShorlogClick = async () => {
    if (!blogId) {
      showGlobalToast('연결된 블로그가 없습니다.', 'error');
      return;
    }

    if (isBlogConverting) return;

    try {
      setIsBlogConverting(true);

      // 1. blogId로 해당 블로그 내용 조회
      const blogDetail = await fetchBlogDetail(blogId);

      if (!blogDetail.content || !blogDetail.content.trim()) {
        showGlobalToast('블로그 내용이 없어서 요약할 수 없습니다.', 'warning');
        return;
      }

      // 2. 블로그 내용을 AI로 요약 (200-800자)
      const aiResponse = await generateAiContent({
        mode: 'summary',
        contentType: 'shorlog',
        content: blogDetail.content,
      });

      console.log('AI 응답:', aiResponse); // 디버깅용

      // 응답이 성공인지 확인 (백엔드는 200-1을 성공 코드로 사용)
      if (!aiResponse.resultCode || !aiResponse.resultCode.startsWith('200')) {
        throw new Error(`AI 서버 오류: ${aiResponse.msg || '알 수 없는 오류'}`);
      }

      // data가 있는지 확인
      if (!aiResponse.data) {
        throw new Error('AI 응답에 데이터가 없습니다.');
      }

      // summary 모드는 AiGenerateSingleResponse 형태로 data.result를 반환
      const singleResponse = aiResponse as AiGenerateSingleResponse;
      const summaryResult = singleResponse.data.result;

      if (!summaryResult || summaryResult.trim() === '') {
        throw new Error('AI가 빈 요약을 반환했습니다.');
      }

      // 3. 요약 결과를 content에 설정
      setContent(summaryResult.trim());

      // 4. 사용자에게 성공 알림
      showGlobalToast('블로그 내용을 숏로그로 요약했어요!', 'success');
    } catch (error) {
      console.error('블로그 → 숏로그 변환 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '블로그를 숏로그로 변환하는데 실패했습니다.';
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

  // Google 이미지 선택
  const handleGoogleImagesSelect = async (selectedUrls: string[]) => {
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
