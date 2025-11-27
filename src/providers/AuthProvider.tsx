'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type UserDto = {
  id: number;
  nickname: string;
  profileImgUrl: string;
};

const fetchCurrentUser = async (): Promise<UserDto | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const resData = await response.json();
    return resData.data as UserDto;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};

const sendLogoutRequest = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '로그아웃 실패');
    }

    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// useAuth 훅 (인증 로직 관리)
function useAuthLogic() {
  const router = useRouter();

  const [loginUser, setLoginUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  const fetchUser = async () => {
    setIsLoading(true);
    const user = await fetchCurrentUser();
    setLoginUser(user);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    await fetchUser();
  };

  const logout = async () => {
    await sendLogoutRequest();
    setLoginUser(null);
    router.replace('/');
  };

  const isLogin = loginUser !== null;

  const authState = useMemo(() => {
    return {
      isLogin,
      loginUser,
      logout,
      setLoginUser, // 외부에서 강제 상태 변경이 필요한 경우 사용
      isLoading, // 로딩 상태 추가
      refreshUser, // 사용자 정보 새로고침 함수 추가
    };
  }, [isLogin, loginUser, isLoading]);

  return authState;
}

// Context 생성 및 사용 훅
// AuthState 타입 정의
type AuthState = ReturnType<typeof useAuthLogic>;

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const authState = useContext(AuthContext);

  if (authState === null) {
    // Provider 외부에서 훅을 호출한 경우
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return authState;
}

// Provider 컴포넌트
export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authState = useAuthLogic(); // 로직 훅 호출

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}
