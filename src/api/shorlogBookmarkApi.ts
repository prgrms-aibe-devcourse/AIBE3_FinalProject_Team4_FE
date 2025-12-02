import apiClient from './apiClient';

export interface ShorlogBookmarkResponse {
  isBookmarked: boolean;
  bookmarkCount: number;
}

// 북마크 추가
export const addBookmark = async (shorlogId: number): Promise<ShorlogBookmarkResponse> => {
  const response = await apiClient(`/api/v1/shorlog/${shorlogId}/bookmark`, {
    method: 'POST',
  });

  if (!response.ok) {
    let errorData = null;
    try {
      const responseText = await response.text();
      if (responseText) {
        errorData = JSON.parse(responseText);
      }
    } catch (parseError) {
      // 파싱 실패 시 무시
    }

    // 상태 코드별 구체적인 에러 메시지
    let errorMessage;
    if (response.status === 401) {
      errorMessage = '로그인이 필요합니다.';
    } else if (response.status === 404) {
      errorMessage = '해당 숏로그를 찾을 수 없습니다.';
    } else if (response.status === 403) {
      errorMessage = '권한이 없습니다.';
    } else if (response.status >= 500) {
      errorMessage = '서버 오류가 발생했습니다.';
    } else {
      errorMessage = errorData?.msg || errorData?.message || `북마크 요청에 실패했습니다. (상태 코드: ${response.status})`;
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data;
};

// 북마크 제거
export const removeBookmark = async (shorlogId: number): Promise<ShorlogBookmarkResponse> => {
  const response = await apiClient(`/api/v1/shorlog/${shorlogId}/bookmark`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorData = null;
    try {
      const responseText = await response.text();
      if (responseText) {
        errorData = JSON.parse(responseText);
      }
    } catch (parseError) {
      // 파싱 실패 시 무시
    }

    // 상태 코드별 구체적인 에러 메시지
    let errorMessage;
    if (response.status === 401) {
      errorMessage = '로그인이 필요합니다.';
    } else if (response.status === 404) {
      errorMessage = '해당 숏로그를 찾을 수 없습니다.';
    } else if (response.status === 403) {
      errorMessage = '권한이 없습니다.';
    } else if (response.status >= 500) {
      errorMessage = '서버 오류가 발생했습니다.';
    } else {
      errorMessage = errorData?.msg || errorData?.message || `북마크 삭제 요청에 실패했습니다. (상태 코드: ${response.status})`;
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data;
};

// 북마크 상태 조회
export const getBookmarkStatus = async (shorlogId: number): Promise<ShorlogBookmarkResponse> => {
  const response = await apiClient(`/api/v1/shorlog/${shorlogId}/bookmark`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('북마크 상태 조회에 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};
