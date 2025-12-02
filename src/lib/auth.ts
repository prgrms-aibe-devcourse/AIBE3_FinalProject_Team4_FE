/**
 * 간단한 인증 체크 유틸리티
 * TODO: 실제 인증 시스템 연동 시 수정 필요
 */

/**
 * 로그인 여부 확인
 * @returns 로그인 상태 (true: 로그인됨, false: 비로그인)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/me`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    return res.ok;
  } catch (e) {
    return false;
  }
}

/**
 * 로그인 필요 액션 체크
 * 비로그인 시 로그인 페이지로 리다이렉트 또는 모달 표시
 */
export async function requireAuth(actionName: string): Promise<boolean> {
  const ok = await isAuthenticated();
  if (!ok) {
    const confirmLogin = window.confirm(
      `${actionName} 기능은 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`
    );

    if (confirmLogin) window.location.href = '/login';

    return false;
  }
  return true;
}

