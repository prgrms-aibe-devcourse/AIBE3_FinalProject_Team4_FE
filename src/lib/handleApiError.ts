import { showGlobalToast } from '@/src/lib/toastStore';

// ApiError가 class든 plain object든 상관 없이 커버
type MaybeApiError = {
  status?: number;
  resultCode?: string;
  message?: string;
};

export function handleApiError(error: unknown, context?: string) {
  const err = (error || {}) as MaybeApiError;

  const status = err.status;
  const message = err.message;

  // 401: 로그인 필요한 기능
  if (status === 401) {
    showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
    return;
  }

  // 403: 권한 없음
  if (status === 403) {
    showGlobalToast('접근 권한이 없습니다.', 'error');
    return;
  }

  // 백엔드 비즈니스 에러 메시지가 있으면 그대로 노출
  if (message) {
    showGlobalToast(message, 'error');
    return;
  }

  // 기타: 컨텍스트 기반 기본 메시지
  if (context) {
    showGlobalToast(`${context} 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`, 'error');
  } else {
    showGlobalToast('요청 처리 중 오류가 발생했습니다.', 'error');
  }
}
