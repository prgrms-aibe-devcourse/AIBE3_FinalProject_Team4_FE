import { useState } from 'react';
import { LocalImage, MAX_FILES, Step } from '../types';

export function useFreeImageModal() {
  const [showUnsplashModal, setShowUnsplashModal] = useState(false);
  const [showPixabayModal, setShowPixabayModal] = useState(false);

  const handleUnsplashPhoto = () => {
    setShowUnsplashModal(true);
  };

  const handlePixabayPhoto = () => {
    setShowPixabayModal(true);
  };

  const handleUnsplashImagesSelect = async (
    selectedUrls: string[],
    images: LocalImage[],
    setImages: React.Dispatch<React.SetStateAction<LocalImage[]>>,
    step: Step,
    goToStep: (step: Step) => void,
    setSelectedIndex: (index: number) => void,
  ) => {
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
          originalFilename: url.split('/').pop() || 'unsplash_image',
        };
      }),
    );

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);

      if (step === 1 && currentCount === 0) {
        goToStep(2);
        setSelectedIndex(0);
      }
    }
  };

  const handlePixabayImagesSelect = async (
    selectedUrls: string[],
    images: LocalImage[],
    setImages: React.Dispatch<React.SetStateAction<LocalImage[]>>,
    step: Step,
    goToStep: (step: Step) => void,
    setSelectedIndex: (index: number) => void,
  ) => {
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
          originalFilename: url.split('/').pop() || 'pixabay_image',
        };
      }),
    );

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);

      if (step === 1 && currentCount === 0) {
        goToStep(2);
        setSelectedIndex(0);
      }
    }
  };

  return {
    showUnsplashModal,
    setShowUnsplashModal,
    showPixabayModal,
    setShowPixabayModal,
    handleUnsplashPhoto,
    handlePixabayPhoto,
    handleUnsplashImagesSelect,
    handlePixabayImagesSelect,
  };
}
