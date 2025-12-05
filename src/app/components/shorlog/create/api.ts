const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  console.log('📤 업로드 요청 orders:', JSON.stringify(orders, null, 2));
  formData.append('orders', JSON.stringify(orders));

  let totalFileSize = 0;
  let fileCount = 0;
  images.forEach((img, index) => {
    if (img.sourceType === 'FILE' && img.file) {
      formData.append('files', img.file);
      totalFileSize += img.file.size;
      fileCount++;
      console.log(
        `  📎 파일 ${index + 1}: ${img.file.name} (${(img.file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
    }
  });

  console.log(`\n📊 업로드 요약:`);
  console.log(`  - 총 이미지 수: ${images.length}`);
  console.log(`  - FILE 타입: ${fileCount}개`);
  console.log(`  - URL 타입: ${images.filter((img) => img.sourceType === 'URL').length}개`);
  console.log(`  - 총 파일 크기: ${(totalFileSize / 1024 / 1024).toFixed(2)}MB`);

  if (totalFileSize > 100 * 1024 * 1024) {
    // 100MB
    throw new Error('파일 전체 크기가 100MB를 초과합니다. 일부 이미지를 제거해주세요.');
  }

  console.log(`\n🚀 업로드 시작: POST /api/v1/shorlog/images/batch`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/images/batch`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ 서버 오류 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(errorData.message || `이미지 업로드 실패 (${response.status})`);
    }

    const result = await response.json();
    console.log('✅ 업로드 성공:', {
      uploadedCount: result.data?.length || 0,
      data: result.data,
    });
    return result.data || [];
  } catch (error) {
    console.error('💥 업로드 오류 상세:', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

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
      throw new Error(errorData.message || `숏로그 생성 실패 (${response.status})`);
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
      throw new Error(errorData.message || `AI API 호출 실패 (${response.status})`);
    }

    const result = await response.json();

    // 백엔드 응답 성공 여부 체크 (200-1 등의 성공 코드)
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

// ========== 임시저장 API ==========

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

// 임시저장 목록 조회
export async function getDrafts(): Promise<DraftResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/draft`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `임시저장 조회 실패 (${response.status})`);
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

// 임시저장 생성
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
      throw new Error(errorData.message || `임시저장 실패 (${response.status})`);
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

// 임시저장 상세 조회
export async function getDraft(id: number): Promise<DraftResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/draft/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `임시저장 조회 실패 (${response.status})`);
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

// 임시저장 삭제
export async function deleteDraft(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/shorlog/draft/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `임시저장 삭제 실패 (${response.status})`);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다.');
    }
    throw error;
  }
}
