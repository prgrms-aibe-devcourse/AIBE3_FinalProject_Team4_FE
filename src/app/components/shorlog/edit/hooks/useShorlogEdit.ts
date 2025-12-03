import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LocalImage,
  MAX_CONTENT_LENGTH,
  Step,
  MAX_FILES,
  UploadImageResponse,
  AspectRatio,

} from '../../create/types';
import { uploadImagesBatch } from '../api';
import { updateShorlog } from '../api';
import { showGlobalToast } from '@/src/lib/toastStore';
import type { ShorlogDetail } from '../../detail/types';

export function useShorlogEdit(shorlogId: string, initialData: ShorlogDetail) {

  // 기존 이미지를 LocalImage 형태로 변환 (모두 재업로드할 예정)
  const initialImages: LocalImage[] = initialData.thumbnailUrls.map((url, index) => ({
    id: `existing-${index}`,
    sourceType: 'URL' as const,
    previewUrl: url,
    remoteUrl: url,
    aspectRatio: 'ORIGINAL' as AspectRatio,
  }));

  const [images, setImages] = useState<LocalImage[]>(initialImages);
  const [uploadedImages, setUploadedImages] = useState<UploadImageResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);



  const currentStepTitle = useMemo(() => {
    if (step === 1) return '섬네일 선택';
    if (step === 2) return '사진 편집';
    return '숏로그 수정';
  }, [step]);

  const sliderImages = useMemo(() => {
    if (uploadedImages.length > 0) {
      return uploadedImages.map((img) => img.imageUrl);
    }
    return images.map((img) => img.previewUrl);
  }, [images, uploadedImages]);

  const safeSelectedIndex = Math.min(selectedIndex, Math.max(images.length - 1, 0));



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

      if (step === 1 && currentCount === 0 && next.length > 0) {
        setStep(2);
        setSelectedIndex(0);
      }
    },
    [images.length, step],
  );

  const goToStep = (next: Step) => {
    setError(null);
    setStep(next);
  };

  const handleNextFromStep2 = async () => {
    if (!images.length) {
      setError('편집할 이미지가 없습니다.');
      return;
    }

    // 모든 이미지를 업로드 (URL 타입은 그대로 전달, FILE 타입은 파일로 전달)
    setIsUploading(true);
    setError(null);

    try {
      // URL 타입은 그대로 유지, FILE 타입만 처리
      const uploaded = await uploadImagesBatch(images);
      setUploadedImages(uploaded);
      goToStep(3);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : '이미지 업로드 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (content: string, hashtags: string[]) => {
    const trimmed = content.trim();

    if (!trimmed) {
      setError('내용을 입력해주세요.');
      return;
    }
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      setError(`내용은 최대 ${MAX_CONTENT_LENGTH}자까지 작성할 수 있어요.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 모든 이미지가 이미 업로드되었으므로 uploadedImages의 ID만 사용
      const allImageIds = uploadedImages.map(img => img.id);

      console.log('📝 수정 요청:', {
        imagesCount: images.length,
        uploadedImagesCount: uploadedImages.length,
        allImageIds,
      });

      if (allImageIds.length === 0) {
        setError('최소 1개의 이미지가 필요합니다.');
        return;
      }

      const result = await updateShorlog(shorlogId, {
        content: trimmed,
        imageIds: allImageIds,
        hashtags,

      });

      showGlobalToast('숏로그가 성공적으로 수정되었습니다!', 'success');
      // 기존 모달 상태를 정리하기 위해 새로고침 방식으로 이동
      window.location.href = `/profile/${result.userId || initialData.userId}`;
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : '숏로그 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

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



  return {
    images,
    setImages,
    uploadedImages,
    isUploading,
    isSubmitting,
    step,
    selectedIndex,
    setSelectedIndex,
    safeSelectedIndex,
    error,
    setError,
    currentStepTitle,
    sliderImages,
    addFiles,
    goToStep,
    handleNextFromStep2,
    handleSubmit,
    changeAspectRatio,
    deleteImage,
    reorderImages,

  };
}

