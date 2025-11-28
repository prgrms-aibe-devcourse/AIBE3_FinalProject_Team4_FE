export type Step = 1 | 2 | 3;
export type AspectRatio = 'ORIGINAL' | '1:1' | '4:5' | '16:9';
export type ImageSourceType = 'file' | 'url'; // 백엔드 @JsonValue는 소문자

export const MAX_CONTENT_LENGTH = 800;
export const MAX_FILES = 10;

export interface LocalImage {
  id: string;
  file?: File;
  sourceType: 'FILE' | 'URL'; // UI에서는 대문자 사용
  previewUrl: string;
  remoteUrl?: string;
  aspectRatio: AspectRatio;
  originalFilename?: string;
}

export interface UploadImageOrderRequest {
  order: number;
  type: ImageSourceType; // 'file' | 'url' (소문자 - 백엔드 JSON 형식)
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
