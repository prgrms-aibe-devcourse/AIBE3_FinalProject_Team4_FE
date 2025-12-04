'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { showGlobalToast } from '../lib/toastStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type UserDto = {
  id: number;
  nickname: string;
  profileImgUrl: string;
};

type AuthState = {
  isLogin: boolean;
  loginUser: UserDto | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setLoginUser: React.Dispatch<React.SetStateAction<UserDto | null>>;
};

const AuthContext = createContext<AuthState | null>(null);

async function fetchCurrentUser(): Promise<UserDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
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
}

async function sendLogoutRequest() {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    let msg = '로그아웃 실패';
    try {
      const errorData = await response.json();
      if (errorData?.msg) msg = errorData.msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
}

function useAuthLogic(): AuthState {
  const router = useRouter();

  const [loginUser, setLoginUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    const user = await fetchCurrentUser();
    setLoginUser(user);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await sendLogoutRequest();
    } catch (e) {
      console.error('Logout error:', e);
      showGlobalToast('로그아웃에 실패했습니다.', 'error');
    } finally {
      setLoginUser(null);
      router.replace('/');
    }
  }, [router]);

  const isLogin = !!loginUser;

  const authState: AuthState = useMemo(
    () => ({
      isLogin,
      loginUser,
      isLoading,
      refreshUser,
      logout,
      setLoginUser,
    }),
    [isLogin, loginUser, isLoading, refreshUser, logout],
  );

  return authState;
}

export function useAuth() {
  const authState = useContext(AuthContext);

  if (authState === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return authState;
}

export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authState = useAuthLogic();

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}
