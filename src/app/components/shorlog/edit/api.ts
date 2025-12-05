import { UpdateShorlogRequest, UpdateShorlogResponse } from './types';
import {
  LocalImage,
  UploadImageOrderRequest,
  UploadImageResponse,
} from '../create/types';

// 이미지 일괄 업로드 (생성과 동일)
export async function uploadImagesBatch(
  images: LocalImage[],
): Promise<UploadImageResponse[]> {
  const formData = new FormData();

  // FILE 타입 이미지의 인덱스를 추적하기 위한 카운터
  let fileIndexCounter = 0;

  const orders: UploadImageOrderRequest[] = images.map((img, index) => {
    const type = img.sourceType.toLowerCase() as 'file' | 'url';
    let fileIndex = null;

    if (img.sourceType === 'FILE') {
      fileIndex = fileIndexCounter;
      fileIndexCounter++;
    }

    return {
      order: index,
      type: type,
      fileIndex: fileIndex,
      url: img.sourceType === 'URL' ? img.remoteUrl ?? null : null,
      aspectRatio: img.aspectRatio,
    };
  });

  formData.append('orders', JSON.stringify(orders));

  let totalFileSize = 0;
  let fileCount = 0;
  images.forEach((img) => {
    if (img.sourceType === 'FILE' && img.file) {
      formData.append('files', img.file);
      totalFileSize += img.file.size;
      fileCount++;
      console.log(`📎 파일 ${fileCount - 1}: ${img.file.name}`);
    }
  });


  if (totalFileSize > 100 * 1024 * 1024) {
    throw new Error('파일 전체 크기가 100MB를 초과합니다. 일부 이미지를 제거해주세요.');
  }

  try {
    const response = await fetch('/api/v1/shorlog/images/batch', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `이미지 업로드 실패 (${response.status})`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }

    if (error instanceof Error && error.message.includes('net::ERR_CONNECTION_RESET')) {
      throw new Error('파일 크기가 너무 크거나 서버 제한을 초과했습니다. 이미지를 압축하거나 개수를 줄여주세요.');
    }

    throw error;
  }
}

// 숏로그 수정 API
export async function updateShorlog(
  shorlogId: string,
  payload: UpdateShorlogRequest
): Promise<UpdateShorlogResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/${shorlogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '숏로그 수정 실패');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('숏로그 수정 오류:', error);
    throw error;
  }
}

// 블로그 연결
export async function connectBlogToShorlog(shorlogId: string, blogId: number): Promise<void> {
  const response = await fetch(`/api/v1/shorlog/${shorlogId}/blog/${blogId}`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('블로그 연결 실패');
  }
}

// 블로그 연결 해제
export async function disconnectBlogFromShorlog(shorlogId: string): Promise<void> {
  const response = await fetch(`/api/v1/shorlog/${shorlogId}/blog`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('블로그 연결 해제 실패');
  }
}

// 숏로그 삭제
export async function deleteShorlog(shorlogId: string): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/${shorlogId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '숏로그 삭제 실패');
  }
}

