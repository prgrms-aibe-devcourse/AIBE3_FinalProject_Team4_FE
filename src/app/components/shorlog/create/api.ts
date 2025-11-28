import {
  AspectRatio,
  CreateShorlogRequest,
  ImageSourceType,
  LocalImage,
  UploadImageOrderRequest,
  UploadImageResponse,
} from './types';

export async function uploadImagesBatchMock(
  images: LocalImage[],
): Promise<UploadImageResponse[]> {
  const orders: UploadImageOrderRequest[] = images.map((img, index) => ({
    order: index,
    type: img.sourceType as ImageSourceType,
    fileIndex: img.sourceType === 'FILE' ? index : null,
    url: img.sourceType === 'URL' ? img.remoteUrl ?? null : null,
    aspectRatio: img.aspectRatio as AspectRatio,
  }));

  console.log('would upload with orders:', orders);

  return images.map((img, index) => ({
    id: index + 1,
    imageUrl: img.previewUrl,
    originalFilename: img.originalFilename ?? `image-${index + 1}.jpg`,
    fileSize: 1024 * 100,
  }));
}

export async function createShorlogMock(payload: CreateShorlogRequest): Promise<void> {
  console.log('would call POST /api/v1/shorlog with:', payload);
  await new Promise((resolve) => setTimeout(resolve, 500));
}
