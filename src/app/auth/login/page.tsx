'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Page() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const onLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (id.trim() === '') {
      alert('아이디 입력해주세요.');
      return;
    }
    if (pw.trim() === '') {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: id,
          password: pw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error?.msg ?? '로그인 실패');
        return;
      }

      await refreshUser();
      router.replace('/');
    } catch (error) {
      alert('서버와 연결할 수 없습니다.');
      console.error(error);
    }
  };

  return (
    <div className="w-screen h-screen bg-black/40 flex items-center justify-center">
      <div className="w-[400px] bg-white rounded-xl p-10 shadow-xl text-center">
        <h1 className="text-2xl font-semibold mb-6">TexTok에 로그인</h1>

        <form onSubmit={onLogin} className="flex flex-col gap-3">
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
            placeholder="TexTok ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-3 bg-[#377DFF] text-white rounded-md text-sm font-medium hover:bg-blue-600 transition"
          >
            로그인
          </button>
        </form>

        <div className="text-sm text-gray-500 mt-4 mb-6">
          아이디 찾기 | 비밀번호 찾기 | 회원가입
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-md mb-2 hover:bg-gray-200 transition">
          <span>🟢</span> Google로 로그인
        </button>

        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-md hover:bg-gray-200 transition">
          <span>🟩</span> Naver로 로그인
        </button>
      </div>
    </div>
  );
}
