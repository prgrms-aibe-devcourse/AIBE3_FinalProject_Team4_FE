import apiClient from './apiClient';

// 팔로우
export const follow = async (followingId: number): Promise<void> => {
  console.log('팔로우 API 호출:', followingId);

  try {
    const response = await apiClient(`/api/v1/follow/${followingId}`, {
      method: 'POST',
    });

    console.log('팔로우 API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      let errorData = null;
      let errorText = '';

      try {
        const responseText = await response.text();
        console.log('응답 텍스트:', responseText);

        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('응답 파싱 실패:', parseError);
        errorText = '응답을 파싱할 수 없습니다.';
      }

      console.error('팔로우 실패:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        errorText,
      });

      // 상태 코드별 구체적인 에러 메시지
      let errorMessage = '';
      if (response.status === 401) {
        errorMessage = '로그인이 필요합니다.';
      } else if (response.status === 404) {
        errorMessage = '해당 유저를 찾을 수 없습니다.';
      } else if (response.status === 403) {
        errorMessage = '권한이 없습니다.';
      } else if (response.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다.';
      } else {
        errorMessage = errorData?.msg || errorData?.message || `팔로우 요청에 실패했습니다. (상태 코드: ${response.status})`;
      }

      throw new Error(errorMessage);
    }

    console.log('팔로우 성공');
  } catch (error) {
    if (error instanceof Error) {
      console.error('팔로우 API 에러:', error.message);
      throw error;
    } else {
      console.error('팔로우 알 수 없는 에러:', error);
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  }
};

// 언팔로우
export const unfollow = async (unfollowingId: number): Promise<void> => {
  console.log('언팔로우 API 호출:', unfollowingId);

  try {
    const response = await apiClient(`/api/v1/follow/${unfollowingId}`, {
      method: 'DELETE',
    });

    console.log('언팔로우 API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      let errorData = null;
      let errorText = '';

      try {
        const responseText = await response.text();
        console.log('응답 텍스트:', responseText);

        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('응답 파싱 실패:', parseError);
        errorText = '응답을 파싱할 수 없습니다.';
      }

      console.error('언팔로우 실패:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        errorText,
      });

      // 상태 코드별 구체적인 에러 메시지
      let errorMessage = '';
      if (response.status === 401) {
        errorMessage = '로그인이 필요합니다.';
      } else if (response.status === 404) {
        errorMessage = '해당 유저를 찾을 수 없습니다.';
      } else if (response.status === 403) {
        errorMessage = '권한이 없습니다.';
      } else if (response.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다.';
      } else {
        errorMessage = errorData?.msg || errorData?.message || `언팔로우 요청에 실패했습니다. (상태 코드: ${response.status})`;
      }

      throw new Error(errorMessage);
    }

    console.log('언팔로우 성공');
  } catch (error) {
    if (error instanceof Error) {
      console.error('언팔로우 API 에러:', error.message);
      throw error;
    } else {
      console.error('언팔로우 알 수 없는 에러:', error);
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  }
};

// 팔로우 여부 확인
export const isFollowing = async (followingId: number): Promise<boolean> => {
  const response = await apiClient(`/api/v1/follow/is-following/${followingId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('팔로우 상태 확인에 실패했습니다.');
  }

  const data = await response.json();

  // 백엔드에서 message로 팔로우 상태를 구분
  const isFollowingState = data.msg === "팔로우 중입니다.";

  return isFollowingState;
};


