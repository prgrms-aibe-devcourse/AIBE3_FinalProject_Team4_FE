/**
 * 간단한 인증 체크 유틸리티
 * TODO: 실제 인증 시스템 연동 시 수정 필요
 */

/**
 * 로그인 여부 확인
 * @returns 로그인 상태 (true: 로그인됨, false: 비로그인)
 */
export function isAuthenticated(): boolean {
  // TODO: 실제 인증 로직으로 대체
  // 예: localStorage의 토큰 확인, 쿠키 확인 등
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('accessToken');
  return !!token;
}

/**
 * 로그인 필요 액션 체크
 * 비로그인 시 로그인 페이지로 리다이렉트 또는 모달 표시
 */
export function requireAuth(actionName: string): boolean {
  if (!isAuthenticated()) {
    const confirmLogin = window.confirm(
      `${actionName} 기능은 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`
    );

    if (confirmLogin) {
      // TODO: 실제 로그인 페이지 경로로 수정
      window.location.href = '/login';
    }

    return false;
  }

  return true;
}

