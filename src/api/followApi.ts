import { showGlobalToast } from '@/src/lib/toastStore';
import apiClient from './apiClient';

// 공통 에러 처리 함수
async function handleFollowResponse(response: Response, actionType: 'follow' | 'unfollow') {
  if (response.ok) {
    if (actionType === 'follow') {
      showGlobalToast('팔로우했습니다.', 'success');
    } else {
      showGlobalToast('언팔로우했습니다.', 'success');
    }
    return;
  }

  let errorMessage =
    actionType === 'follow' ? '팔로우 요청에 실패했습니다.' : '언팔로우 요청에 실패했습니다.';

  try {
    const text = await response.text();
    if (text) {
      const parsed = JSON.parse(text);
      errorMessage = parsed.msg || errorMessage;
    }
  } catch {
    errorMessage = '응답을 해석하는 중 오류가 발생했습니다.';
  }

  //showGlobalToast(errorMessage, 'warning');

  throw new Error(errorMessage);
}

// 팔로우
export const follow = async (followingId: number): Promise<void> => {
  try {
    const response = await apiClient(`/api/v1/follow/${followingId}`, {
      method: 'POST',
    });

    await handleFollowResponse(response, 'follow');
  } catch (err: any) {
    showGlobalToast(err.message || '팔로우 중 알 수 없는 오류가 발생했습니다.', 'error');
    throw err;
  }
};

// 언팔로우
export const unfollow = async (unfollowingId: number): Promise<void> => {
  try {
    const response = await apiClient(`/api/v1/follow/${unfollowingId}`, {
      method: 'DELETE',
    });

    await handleFollowResponse(response, 'unfollow');
  } catch (err: any) {
    showGlobalToast(err.message || '언팔로우 중 알 수 없는 오류가 발생했습니다.', 'error');
    throw err;
  }
};

// 팔로우 여부 확인
export const isFollowing = async (followingId: number): Promise<boolean> => {
  const response = await apiClient(`/api/v1/follow/is-following/${followingId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    let msg = '팔로우 상태 확인 실패';

    if (response.status === 401) msg = '로그인이 필요합니다.';
    if (response.status === 404) msg = '해당 유저를 찾을 수 없습니다.';

    showGlobalToast(msg, 'warning');
    throw new Error(msg);
  }

  const rsData = await response.json();
  return rsData.data?.isFollowing ?? false;
};
