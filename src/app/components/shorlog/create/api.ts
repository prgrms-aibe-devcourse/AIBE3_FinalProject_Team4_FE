import {
  AspectRatio,
  CreateShorlogRequest,
  ImageSourceType,
  LocalImage,
  UploadImageOrderRequest,
  UploadImageResponse,
} from './types';

export async function uploadImagesBatch(
  images: LocalImage[],
): Promise<UploadImageResponse[]> {
  const formData = new FormData();

  const orders: UploadImageOrderRequest[] = images.map((img, index) => ({
    order: index,
    type: img.sourceType.toLowerCase() as ImageSourceType, // "FILE" -> "file", "URL" -> "url"
    fileIndex: img.sourceType === 'FILE' ? index : null,
    url: img.sourceType === 'URL' ? img.remoteUrl ?? null : null,
    aspectRatio: img.aspectRatio as AspectRatio,
  }));

  formData.append('orders', JSON.stringify(orders));

  let totalFileSize = 0;
  images.forEach((img, index) => {
    if (img.sourceType === 'FILE' && img.file) {
      formData.append('files', img.file);
      totalFileSize += img.file.size;
      console.log(`  📎 파일 ${index + 1}: ${img.file.name} (${(img.file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
  });

  if (totalFileSize > 100 * 1024 * 1024) { // 100MB
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
      console.error('❌ 서버 오류:', errorData);
      throw new Error(errorData.message || `이미지 업로드 실패 (${response.status})`);
    }

    const result = await response.json();
    console.log('✅ 업로드 성공:', result);
    return result.data || [];
  } catch (error) {
    console.error('💥 업로드 오류:', error);

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }

    if (error instanceof Error && error.message.includes('net::ERR_CONNECTION_RESET')) {
      throw new Error('파일 크기가 너무 크거나 서버 제한을 초과했습니다. 이미지를 압축하거나 개수를 줄여주세요.');
    }

    throw error;
  }
}

export async function createShorlog(payload: CreateShorlogRequest): Promise<any> {
  try {
    const response = await fetch('/api/v1/shorlog', {
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
    const response = await fetch('/api/v1/ais', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `AI API 호출 실패 (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
    throw error;
  }
}
