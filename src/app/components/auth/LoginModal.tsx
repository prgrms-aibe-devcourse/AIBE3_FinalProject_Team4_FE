'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginModal() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useLoginModal();
  const { refreshUser } = useAuth();

  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleSocialLogin = (provider: 'google' | 'naver' | 'kakao') => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  useEffect(() => {
    if (isOpen) close();
  }, [pathname]);

  if (!isOpen) return null;

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: id, password: pw }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error?.msg ?? '로그인 실패');
      return;
    }

    await refreshUser();
    close();
    router.push('/'); // 로그인 후 홈으로 이동
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

      <div className="relative w-[400px] bg-white rounded-lg p-10 shadow-xl z-[1000]">
        {/* Close */}
        <button className="absolute top-4 right-4 text-gray-600 hover:text-black" onClick={close}>
          ✕
        </button>

        <h1 className="text-2xl font-bold text-center mb-6">TexTok에 로그인</h1>

        <form onSubmit={onLogin} className="flex flex-col gap-3">
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm"
            placeholder="TexTok ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-3 bg-[#2979FF] text-white rounded-md text-sm font-medium hover:bg-blue-600 transition"
          >
            로그인
          </button>
        </form>

        {/* Links */}
        <div className="text-sm text-gray-500 mt-4 mb-6 flex items-center justify-center gap-3">
          <Link href="/auth/find-id" onClick={close} className="hover:text-blue-600 transition">
            아이디 찾기
          </Link>
          <span>|</span>
          <Link
            href="/auth/find-password"
            onClick={close}
            className="hover:text-blue-600 transition"
          >
            비밀번호 찾기
          </Link>
          <span>|</span>
          <Link href="/auth/register" onClick={close} className="hover:text-blue-600 transition">
            회원가입
          </Link>
        </div>

        {/* --- Social Login Buttons --- */}

        {/* --- Social Login Buttons --- */}

        <div className="space-y-2 mt-4">
          {/* Google */}
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 py-2.5 
                    border border-gray-300 rounded-lg bg-white 
                    hover:shadow-sm hover:bg-gray-50 transition"
          >
            <Image src="/icons/google.png" alt="Google" width={20} height={20} />
            <span className="text-sm text-gray-700 font-medium">Google로 계속하기</span>
          </button>

          {/* Naver */}
          <button
            onClick={() => handleSocialLogin('naver')}
            className="w-full flex items-center justify-center gap-3 py-2.5 
                    border border-gray-300 rounded-lg bg-white 
                    hover:shadow-sm hover:bg-gray-50 transition"
          >
            <Image src="/icons/naver.png" alt="Naver" width={20} height={20} />
            <span className="text-sm text-gray-700 font-medium">Naver로 계속하기</span>
          </button>

          {/* Kakao */}
          <button
            onClick={() => handleSocialLogin('kakao')}
            className="w-full flex items-center justify-center gap-3 py-2.5 
                    border border-gray-300 rounded-lg bg-white 
                    hover:shadow-sm hover:bg-gray-50 transition"
          >
            <Image src="/icons/kakao.png" alt="Kakao" width={20} height={20} />
            <span className="text-sm text-gray-700 font-medium">Kakao로 계속하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
