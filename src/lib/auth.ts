/**
 * 간단한 인증 체크 유틸리티
 * TODO: 실제 인증 시스템 연동 시 수정 필요
 */

import { showGlobalToast } from './toastStore';

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
 * 비로그인 시 토스트 알림 표시
 */
export function requireAuth(actionName: string): boolean {
  if (!isAuthenticated()) {
    showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
    return false;
  }

  return true;
}

