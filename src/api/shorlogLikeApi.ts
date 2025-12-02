import apiClient from './apiClient';

export interface ShorlogLikeResponse {
  isLiked: boolean;
  likeCount: number;
}

// 좋아요 추가
export const addLike = async (shorlogId: number): Promise<ShorlogLikeResponse> => {
  const response = await apiClient(`/api/v1/shorlog/${shorlogId}/like`, {
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
      errorMessage = errorData?.msg || errorData?.message || `좋아요 요청에 실패했습니다. (상태 코드: ${response.status})`;
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data;
};

// 좋아요 취소
export const removeLike = async (shorlogId: number): Promise<ShorlogLikeResponse> => {
  const response = await apiClient(`/api/v1/shorlog/${shorlogId}/like`, {
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
      errorMessage = errorData?.msg || errorData?.message || `좋아요 취소 요청에 실패했습니다. (상태 코드: ${response.status})`;
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data;
};

// 좋아요 상태 조회
export const getLikeStatus = async (shorlogId: number): Promise<ShorlogLikeResponse> => {
  const response = await apiClient(`/api/v1/shorlog/${shorlogId}/like`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('좋아요 상태 조회에 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};
