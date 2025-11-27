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

function useAuthLogic() {
  const router = useRouter();

  const [loginUser, setLoginUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      setLoginUser,
      isLoading,
      refreshUser,
    };
  }, [isLogin, loginUser, isLoading]);

  return authState;
}

type AuthState = ReturnType<typeof useAuthLogic>;

export const AuthContext = createContext<AuthState | null>(null);

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
