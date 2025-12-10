const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

import {
  CreateShorlogRequest,
  LocalImage,
  UploadImageOrderRequest,
  UploadImageResponse,
} from './types';

export async function uploadImagesBatch(images: LocalImage[]): Promise<UploadImageResponse[]> {
  const formData = new FormData();

  const orders: UploadImageOrderRequest[] = images.map((img, index) => {
    const type = img.sourceType.toLowerCase() as 'file' | 'url';
    return {
      order: index,
      type: type,
      fileIndex: img.sourceType === 'FILE' ? index : null,
      url: img.sourceType === 'URL' ? (img.remoteUrl ?? null) : null,
      aspectRatio: img.aspectRatio,
    };
  });

  formData.append('orderItems', JSON.stringify(orders));

  let totalFileSize = 0;
  let fileCount = 0;
  images.forEach((img, index) => {
    if (img.sourceType === 'FILE' && img.file) {
      formData.append('files', img.file);
      totalFileSize += img.file.size;
      fileCount++;
    }
  });

  if (totalFileSize > 100 * 1024 * 1024) {
    throw new Error('파일 전체 크기가 100MB를 초과합니다. 일부 이미지를 제거해주세요.');
  }


  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/images/batch`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // RsData 형식: { resultCode, msg, data }
      throw new Error(errorData.msg || errorData.message || `이미지 업로드 실패 (${response.status})`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }

    if (error instanceof Error && error.message.includes('net::ERR_CONNECTION_RESET')) {
      throw new Error(
        '파일 크기가 너무 크거나 서버 제한을 초과했습니다. 이미지를 압축하거나 개수를 줄여주세요.',
      );
    }

    throw error;
  }
}

export async function createShorlog(payload: CreateShorlogRequest): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.msg || errorData.message || errorData.error || `숏로그 생성 실패 (${response.status})`;

      if (
        response.status === 400 &&
        (errorMessage.toLowerCase().includes('해시태그') ||
          errorMessage.toLowerCase().includes('hashtag') ||
          errorMessage.toLowerCase().includes('특수문자'))
      ) {
        throw new Error('해시태그는 한글, 영문, 숫자만 사용 가능합니다.');
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
    throw error;
  }
}

export async function callAiApi(params: {
  mode: 'hashtag' | 'keywordForUnsplash' | 'keywordForGoogle';
  content: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/ais`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: params.mode,
        contentType: 'shorlog',
        content: params.content,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || errorData.message || `AI API 호출 실패 (${response.status})`);
    }

    const result = await response.json();

    if (!result.resultCode || !result.resultCode.startsWith('200')) {
      throw new Error(`AI API 오류: ${result.msg || '알 수 없는 오류'}`);
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
    throw error;
  }
}

export interface DraftData {
  content: string;
  imageIds: number[];
  hashtags: string[];
}

export interface DraftResponse {
  id: number;
  content: string;
  thumbnailUrls: string[];
  hashtags: string[];
  createdAt: string;
}

export async function getDrafts(): Promise<DraftResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/draft`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || errorData.message || `임시저장 조회 실패 (${response.status})`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다.');
    }
    throw error;
  }
}

export async function createDraft(data: DraftData): Promise<DraftResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.msg || errorData.message || errorData.error || `임시저장 실패 (${response.status})`;

      if (
        response.status === 400 &&
        (errorMessage.toLowerCase().includes('해시태그') ||
          errorMessage.toLowerCase().includes('hashtag') ||
          errorMessage.toLowerCase().includes('특수문자'))
      ) {
        throw new Error('해시태그는 한글, 영문, 숫자만 사용 가능합니다.');
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다.');
    }
    throw error;
  }
}

export async function getDraft(id: number): Promise<DraftResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/draft/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || errorData.message || `임시저장 조회 실패 (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다.');
    }
    throw error;
  }
}

export async function deleteDraft(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/draft/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || errorData.message || `임시저장 삭제 실패 (${response.status})`);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다.');
    }
    throw error;
  }
}