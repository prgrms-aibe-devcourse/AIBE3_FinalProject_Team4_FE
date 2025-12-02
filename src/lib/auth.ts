/**
 * 간단한 인증 체크 유틸리티
 * TODO: 실제 인증 시스템 연동 시 수정 필요
 */

import { showGlobalToast } from './toastStore';

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
 * 비로그인 시 토스트 알림 표시
 */
export function requireAuth(actionName: string): boolean {
  if (!isAuthenticated()) {
    showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
    return false;
  }
  return true;
}

