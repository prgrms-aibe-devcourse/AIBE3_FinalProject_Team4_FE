'use client';

import { apiFetch } from '@/lib/backend/client';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleSumbit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const usernameInput = form.elements.namedItem('username') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLTextAreaElement;

    if (usernameInput.value.trim() === '' || usernameInput.value.length === 0) {
      alert('아이디 입력해주세요.');
      usernameInput.focus();
      return;
    }

    if (passwordInput.value.trim() === '' || passwordInput.value.length === 0) {
      alert('비밀번호를 입력해주세요.');
      passwordInput.focus();
      return;
    }

    apiFetch(`/api/v1/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: usernameInput.value,
        password: passwordInput.value,
      }),
    }).then((data) => {
      alert(data.msg);
      router.replace(`/login`);
    });
  };

  return (
    <>
      <h1>로그인</h1>
      <form className="flex flex-col gap-2 p-2" onSubmit={handleSumbit}>
        <input
          className="border p-2 rounded"
          type="text"
          name="username"
          placeholder="아이디를 입력하세요."
          autoFocus
        />

        <input
          className="border p-2 rounded"
          type="password"
          name="password"
          placeholder="비밀번호를 입력하세요."
          autoFocus
        />
        <button className="border p-2 rounded" type="submit">
          로그인
        </button>
      </form>
    </>
  );
}
