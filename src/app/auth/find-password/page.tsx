'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function FindPasswordPage() {
  const router = useRouter();

  // -------- state ----------
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecked, setUsernameChecked] = useState(false);

  const [email, setEmail] = useState(''); // 조회된 이메일
  const [maskedEmail, setMaskedEmail] = useState('');

  const [code, setCode] = useState('');

  const [sendSuccess, setSendSuccess] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const [sendError, setSendError] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [verifyMessage, setVerifyMessage] = useState('');

  // -------- helper: 마스킹 --------
  const maskEmail = (email: string) => {
    const [id, domain] = email.split('@');
    if (id.length <= 3) return `${id[0]}***@${domain}`;
    return `${id.slice(0, 3)}***${id.slice(-1)}@${domain}`;
  };

  // -------- Step 1: 아이디 확인 --------
  const onCheckUsername = async () => {
    setUsernameError('');
    setUsernameChecked(false);
    setEmail('');
    setMaskedEmail('');
    setVerifyStatus('idle');
    setVerifyMessage('');

    if (!username.trim()) {
      setUsernameError('아이디를 입력해주세요.');
      return;
    }

    try {
      // 1) ID 존재 여부 체크
      const res1 = await fetch(`${API}/api/v1/auth/check-username?username=${username}`);
      const data1 = await res1.json();

      if (data1.data?.isAvailable === true) {
        // true = 사용 가능 = 계정 없음
        setUsernameError('존재하지 않는 아이디입니다.');
        return;
      }

      // 2) ID로 이메일 조회
      const res2 = await fetch(`${API}/api/v1/auth/get-email?username=${username}`);
      const data2 = await res2.json();

      if (!res2.ok || !data2.data?.email) {
        setUsernameError('등록된 이메일이 없습니다.');
        return;
      }

      const realEmail = data2.data.email;

      setEmail(realEmail);
      setMaskedEmail(maskEmail(realEmail));
      setUsernameChecked(true);
    } catch {
      setUsernameError('서버 오류가 발생했습니다.');
    }
  };

  // -------- Step 2: 인증 코드 전송 --------
  const onSendCode = async () => {
    setSendError('');

    setIsResent(sendSuccess);
    setSendSuccess(true);
    setIsCodeSent(true);

    try {
      const res = await fetch(`${API}/api/v1/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: email, // 이메일은 서버에서 조회된 값을 사용
      });

      const data = await res.json();
      if (!res.ok) {
        setSendSuccess(false);
        setIsCodeSent(false);
        setSendError(data.msg ?? '코드 전송 실패');
      }
    } catch {
      setSendSuccess(false);
      setIsCodeSent(false);
      setSendError('서버 오류가 발생했습니다.');
    }
  };

  // -------- Step 3: 인증 코드 검증 --------
  const onVerifyCode = async () => {
    setVerifyStatus('idle');
    setVerifyMessage('');

    if (!code.trim()) {
      setVerifyStatus('error');
      setVerifyMessage('인증 코드를 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`${API}/api/v1/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      const ok = data.resultCode?.startsWith('2');

      if (!res.ok || !ok) {
        setVerifyStatus('error');
        setVerifyMessage(data.msg ?? '인증 실패');
        return;
      }

      const token = data.data?.resetPasswordToken ?? data.data?.emailVerificationToken ?? null;

      if (token) sessionStorage.setItem('resetPasswordToken', token);

      sessionStorage.setItem('fp_username', username);
      sessionStorage.setItem('fp_email', email);

      setVerifyStatus('success');
      setVerifyMessage(data.msg ?? '인증이 완료되었습니다.');
    } catch {
      setVerifyStatus('error');
      setVerifyMessage('서버 오류가 발생했습니다.');
    }
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-20 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
          <p className="text-gray-500 text-sm">아이디로 등록된 이메일을 인증해주세요</p>
        </div>

        {/* ------------------ STEP 1: 아이디 ------------------ */}
        <div className="space-y-1">
          <label className="font-medium text-sm text-gray-700">TexTok ID</label>

          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError('');
                setUsernameChecked(false);
              }}
              placeholder="아이디 입력"
              className={`flex-1 h-11 px-3 rounded-md bg-gray-100 focus:bg-white outline-none
                ${usernameError ? 'border border-red-500' : 'border border-transparent focus:border-blue-500'}`}
            />

            <button
              type="button"
              onClick={onCheckUsername}
              className="h-11 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
            >
              확인
            </button>
          </div>

          {usernameError && (
            <p className="text-red-500 text-[13px] flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {usernameError}
            </p>
          )}

          {/* 이메일 표시 */}
          {usernameChecked && (
            <p className="text-green-600 text-sm flex items-center gap-1 mt-1">
              <Check className="w-4 h-4" /> 이메일: {maskedEmail}
            </p>
          )}
        </div>

        {/* ------------------ STEP 2: 이메일 인증 ------------------ */}
        {usernameChecked && (
          <div className="space-y-1">
            <label className="font-medium text-sm text-gray-700">이메일 인증</label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSendCode}
                className="h-11 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
              >
                {sendSuccess ? '재전송' : '전송'}
              </button>
            </div>

            {/* 메시지 */}
            {sendSuccess && !isResent && (
              <p className="text-green-600 text-[13px] flex items-center gap-1">
                <Check className="w-4 h-4" /> 인증 코드가 전송되었습니다.
              </p>
            )}

            {sendSuccess && isResent && (
              <p className="text-green-600 text-[13px] flex items-center gap-1">
                <Check className="w-4 h-4" /> 코드가 다시 전송되었습니다.
              </p>
            )}

            {sendError && <p className="text-red-500 text-[13px]">{sendError}</p>}
          </div>
        )}

        {/* ------------------ STEP 3: 코드 입력 ------------------ */}
        {isCodeSent && (
          <div className="space-y-1">
            <label className="font-medium text-sm text-gray-700">인증 코드</label>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setVerifyStatus('idle');
                  setVerifyMessage('');
                }}
                placeholder="6자리 입력"
                className="flex-1 h-11 px-3 rounded-md bg-gray-100 focus:bg-white outline-none border border-transparent focus:border-blue-500"
              />

              <button
                type="button"
                onClick={onVerifyCode}
                className="h-11 px-4 bg-gray-100 border border-blue-500 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition"
              >
                인증
              </button>
            </div>

            {verifyStatus === 'success' && (
              <p className="text-green-600 text-[13px] flex items-center gap-1">
                <Check className="w-4 h-4" /> {verifyMessage}
              </p>
            )}

            {verifyStatus === 'error' && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {verifyMessage}
              </p>
            )}

            {/* 다음 단계 */}
            {verifyStatus === 'success' && (
              <button
                onClick={() => router.push('/auth/find-password/reset')}
                className="w-full h-11 mt-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
              >
                비밀번호 재설정하기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
