export type Step = 1 | 2 | 3;
export type AspectRatio = 'ORIGINAL' | '1:1' | '4:5' | '16:9';
export type ImageSourceType = 'file' | 'url';

export const MAX_CONTENT_LENGTH = 800;
export const MAX_FILES = 10;

export interface LocalImage {
  id: string;
  file?: File;
  sourceType: 'FILE' | 'URL';
  previewUrl: string;
  remoteUrl?: string;
  aspectRatio: AspectRatio;
  originalFilename?: string;
}

export interface UploadImageOrderRequest {
  order: number;
  type: ImageSourceType;
  fileIndex?: number | null;
  url?: string | null;
  aspectRatio: AspectRatio;
}

export interface UploadImageResponse {
  id: number;
  imageUrl: string;
  originalFilename: string;
  fileSize: number;
}

export interface CreateShorlogRequest {
  content: string;
  imageIds: number[];
  hashtags: string[];
}

export interface BlogImage {
  id: number;
  imageUrl: string;
  originalFilename: string;
}

export interface BlogImageListResponse {
  images: BlogImage[];
}

