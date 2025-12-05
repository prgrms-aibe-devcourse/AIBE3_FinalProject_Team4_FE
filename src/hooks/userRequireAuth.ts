'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { showGlobalToast } from '../lib/toastStore';

/**
 * 인증이 필요한 액션 실행 시 사용하는 훅
 * AuthProvider의 로그인 상태(loginUser) 기반으로 동작함
 */
export function useRequireAuth() {
  const { isLogin } = useAuth();

  return (actionName?: string): boolean => {
    if (!isLogin) {
      showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
      return false;
    }
    return true;
  };
}
