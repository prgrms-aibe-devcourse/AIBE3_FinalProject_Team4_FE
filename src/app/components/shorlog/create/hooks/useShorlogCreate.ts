import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LocalImage,
  MAX_CONTENT_LENGTH,
  Step,
  MAX_FILES,
  UploadImageResponse,
  AspectRatio,
  ShorlogRelatedBlogSummary,
} from '../types';
import { uploadImagesBatch, createShorlog } from '../api';

export function useShorlogCreate() {
  const router = useRouter();
  const [images, setImages] = useState<LocalImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadImageResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 블로그 연결 모달 관련
  const [showBlogConnectModal, setShowBlogConnectModal] = useState(false);
  const [createdShorlogId, setCreatedShorlogId] = useState<string | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<ShorlogRelatedBlogSummary[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);

  const currentStepTitle = useMemo(() => {
    if (step === 1) return '섬네일 선택';
    if (step === 2) return '사진 편집';
    return '숏로그 작성';
  }, [step]);

  const sliderImages = useMemo(() => {
    if (uploadedImages.length > 0) {
      return uploadedImages.map((img) => img.imageUrl);
    }
    return images.map((img) => img.previewUrl);
  }, [images, uploadedImages]);

  const safeSelectedIndex = Math.min(selectedIndex, Math.max(images.length - 1, 0));

  // 최근 블로그 목록 조회
  const fetchRecentBlogs = async () => {
    setIsLoadingBlogs(true);
    try {
      const response = await fetch('/api/v1/shorlog/my/recent-blogs', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('최근 블로그 목록 조회 실패');
      }

      const data = await response.json();
      setRecentBlogs(data.content || []);
    } catch (e) {
      console.error('최근 블로그 목록 조회 실패:', e);
      setRecentBlogs([]);
    } finally {
      setIsLoadingBlogs(false);
    }
  };

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

    setIsUploading(true);
    setError(null);

    try {
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
    if (!uploadedImages.length) {
      setError('이미지를 먼저 업로드해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createShorlog({
        content: trimmed,
        imageIds: uploadedImages.map((img) => img.id),
        hashtags,
      });

      const shorlogId = result.data?.id;
      const userId = result.data?.userId;
      if (shorlogId) {
        setCreatedShorlogId(shorlogId);
        await fetchRecentBlogs();
        setShowBlogConnectModal(true);
      } else {
        alert('숏로그가 성공적으로 생성되었습니다!');
        if (userId) {
          router.push(`/profile/${userId}`);
        } else {
          router.push('/shorlog/feed');
        }
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : '숏로그 생성 중 오류가 발생했습니다.');
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

  // 블로그 연결 핸들러
  const handleSelectBlog = async (blogId: ShorlogRelatedBlogSummary['id']) => {
    if (!createdShorlogId) return;

    try {
      console.log('블로그 연결:', { shorlogId: createdShorlogId, blogId });

      setShowBlogConnectModal(false);
      router.push(`/shorlog/${createdShorlogId}`);
    } catch (e) {
      console.error('블로그 연결 실패:', e);
      setError(e instanceof Error ? e.message : '블로그 연결 중 오류가 발생했습니다.');
    }
  };

  const handleCreateNewBlog = () => {
    setShowBlogConnectModal(false);
    router.push('/blogs/write');
  };

  const handleSkipConnection = () => {
    setShowBlogConnectModal(false);
    router.push('/mypage');
  };

  return {
    // State
    images,
    setImages,
    uploadedImages,
    isUploading,
    isSubmitting,
    step,
    selectedIndex,
    setSelectedIndex,
    error,
    setError,
    currentStepTitle,
    sliderImages,
    safeSelectedIndex,
    // 블로그 연결 모달 관련
    showBlogConnectModal,
    setShowBlogConnectModal,
    createdShorlogId,
    recentBlogs,
    isLoadingBlogs,
    // Actions
    addFiles,
    goToStep,
    handleNextFromStep2,
    handleSubmit,
    changeAspectRatio,
    deleteImage,
    reorderImages,
    // 블로그 연결 핸들러
    handleSelectBlog,
    handleCreateNewBlog,
    handleSkipConnection,
    fetchRecentBlogs,
  };
}

