'use client';

import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordSuccessPage() {
  const router = useRouter();
  const { open } = useLoginModal();

  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-20 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />

        <h1 className="text-2xl font-bold mt-4">비밀번호 변경 완료!</h1>

        <p className="text-gray-500 text-sm">
          비밀번호가 성공적으로 변경되었습니다.
          <br />
          이제 새 비밀번호로 로그인할 수 있어요.
        </p>

        <div className="space-y-3 mt-6">
          {/* 로그인 모달 열기 */}
          <button
            onClick={open}
            className="w-full h-11 bg-[#2979FF] text-white rounded-md font-semibold hover:bg-[#1f5edb] transition"
          >
            로그인하러 가기
          </button>

          {/* 메인으로 이동 */}
          <button
            onClick={() => router.push('/')}
            className="w-full h-11 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
