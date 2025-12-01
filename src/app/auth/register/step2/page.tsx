'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function RegisterStep2Page() {
  const router = useRouter();

  // Step1에서 저장한 정보
  const [step1Data, setStep1Data] = useState<{
    email: string;
    userId: string;
    pw: string;
    verificationToken: string;
  } | null>(null);

  // 입력값
  const [nickname, setNickname] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');

  // 닉네임 검증/상태
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameAvailable, setNicknameAvailable] = useState(false);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState('');

  // 생년월일 / 성별 에러
  const [dobError, setDobError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [formError, setFormError] = useState('');

  // 가입 요청 로딩
  const [loading, setLoading] = useState(false);

  /* ---------------- Step1 정보 가져오기 ---------------- */
  useEffect(() => {
    const saved = sessionStorage.getItem('register_step1');
    if (!saved) {
      router.replace('/auth/register');
      return;
    }
    setStep1Data(JSON.parse(saved));
  }, [router]);

  /* ---------------- 닉네임 기본 검증 ---------------- */
  const validateNickname = (v: string) => {
    if (!v.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      return false;
    }
    if (v.length < 4 || v.length > 30) {
      setNicknameError('닉네임은 4~30자여야 합니다.');
      return false;
    }
    setNicknameError('');
    return true;
  };

  /* ---------------- 닉네임 실시간 중복 체크 ---------------- */
  useEffect(() => {
    // 입력이 아예 없으면 초기화
    if (!nickname.trim()) {
      setNicknameError('');
      setNicknameAvailable(false);
      setNicknameChecking(false);
      setNicknameCheckMsg('');
      return;
    }

    // 기본 문법 검증 먼저
    const isValid = validateNickname(nickname);
    if (!isValid) {
      setNicknameAvailable(false);
      setNicknameChecking(false);
      setNicknameCheckMsg('');
      return;
    }

    // 문법 OK → 서버 중복 체크 (디바운스)
    setNicknameChecking(true);
    setNicknameAvailable(false);
    setNicknameCheckMsg('');

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API}/api/v1/users/check-nickname?nickname=${encodeURIComponent(nickname)}`,
        );
        const data = await res.json();

        const available = data.resultCode === '200';

        if (available) {
          setNicknameAvailable(true);
          setNicknameError('');
          setNicknameCheckMsg('사용 가능한 닉네임입니다.');
        } else {
          setNicknameAvailable(false);
          setNicknameError(data.msg ?? '이미 사용 중인 닉네임입니다.');
          setNicknameCheckMsg('');
        }
      } catch {
        setNicknameAvailable(false);
        setNicknameError('서버 오류가 발생했습니다.');
        setNicknameCheckMsg('');
      } finally {
        setNicknameChecking(false);
      }
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timer);
  }, [nickname]);

  /* ---------------- 생년월일 검증 ---------------- */
  const validateDob = () => {
    if (!dobYear || !dobMonth || !dobDay) {
      setDobError('생년월일을 모두 선택해주세요.');
      return false;
    }

    const year = Number(dobYear);
    const month = Number(dobMonth);
    const day = Number(dobDay);

    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();

    // 1) 존재하지 않는 날짜 체크
    // 예: 2025-02-30 → Date가 3월 2일로 바뀌어버림
    if (
      selectedDate.getFullYear() !== year ||
      selectedDate.getMonth() !== month - 1 ||
      selectedDate.getDate() !== day
    ) {
      setDobError('존재하지 않는 날짜입니다.');
      return false;
    }

    // 2) 오늘 이후 날짜 금지
    if (selectedDate > today) {
      setDobError('생년월일에 미래 날짜는 입력할 수 없습니다.');
      return false;
    }

    // 3) 최소 나이 제한 (13세)
    const minBirthDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

    if (selectedDate > minBirthDate) {
      setDobError('만 13세 이상만 가입할 수 있습니다.');
      return false;
    }

    // 4) (선택) 너무 오래된 나이 제한 (110세)
    if (year < today.getFullYear() - 110) {
      setDobError('유효하지 않은 생년월일입니다.');
      return false;
    }

    setDobError('');
    return true;
  };

  /* ---------------- 성별 검증 ---------------- */
  const validateGender = () => {
    if (!gender) {
      setGenderError('성별을 선택해주세요.');
      return false;
    }
    setGenderError('');
    return true;
  };

  /* ---------------- 회원가입 요청 ---------------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!step1Data) return;

    const isDobValid = validateDob();
    const isGenderValid = validateGender();

    // 닉네임 쪽은 실시간으로 항상 돌고 있으니 상태만 확인
    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      return;
    }
    if (nicknameError) {
      setFormError(nicknameError);
      return;
    }
    if (!nicknameAvailable) {
      setFormError('사용 가능한 닉네임인지 확인 중입니다.');
      return;
    }

    if (!isDobValid || !isGenderValid) return;

    const dateOfBirth = `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`;

    const body = {
      email: step1Data.email,
      username: step1Data.userId,
      password: step1Data.pw,
      nickname,
      dateOfBirth,
      gender,
      verificationToken: step1Data.verificationToken,
    };

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.msg ?? '회원가입에 실패했습니다.');
        setLoading(false);
        return;
      }

      // 가입 성공
      sessionStorage.removeItem('register_step1');
      router.replace('/auth/success/register');
    } catch {
      setFormError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-20 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">가입 (2/2)</h1>
          <p className="text-gray-500 text-sm">프로필 정보를 입력해주세요</p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          {/* ---------------- 닉네임 ---------------- */}
          <div className="space-y-1">
            <label className="font-medium text-sm text-gray-700">닉네임</label>

            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setFormError('');
              }}
              placeholder="4~30자"
              className={`h-11 px-3 w-full rounded-md bg-gray-100 focus:bg-white outline-none transition
                ${
                  nicknameError
                    ? 'border border-red-500'
                    : 'border border-transparent focus:border-blue-500'
                }`}
            />

            {/* 닉네임 상태 메시지 */}
            {nicknameChecking && !nicknameError && (
              <p className="text-gray-400 text-[13px]">· · · 확인 중...</p>
            )}

            {nicknameAvailable && nicknameCheckMsg && (
              <p className="text-green-600 text-[13px] flex items-center gap-1">
                <Check className="w-4 h-4" /> {nicknameCheckMsg}
              </p>
            )}

            {nicknameError && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {nicknameError}
              </p>
            )}
          </div>

          {/* ---------------- 생년월일 ---------------- */}
          <div className="space-y-1">
            <label className="font-medium text-sm text-gray-700">생년월일</label>

            <div className="flex gap-2">
              {/* 연도 */}
              <select
                value={dobYear}
                onChange={(e) => {
                  setDobYear(e.target.value);
                  setDobError('');
                }}
                className="flex-1 h-11 px-2 rounded-md bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500"
              >
                <option value="">연도</option>
                {Array.from({ length: 60 }, (_, i) => 2025 - i).map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>

              {/* 월 */}
              <select
                value={dobMonth}
                onChange={(e) => {
                  setDobMonth(e.target.value);
                  setDobError('');
                }}
                className="w-24 h-11 px-2 rounded-md bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500"
              >
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m.toString()}>
                    {m}
                  </option>
                ))}
              </select>

              {/* 일 */}
              <select
                value={dobDay}
                onChange={(e) => {
                  setDobDay(e.target.value);
                  setDobError('');
                }}
                className="w-24 h-11 px-2 rounded-md bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500"
              >
                <option value="">일</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d.toString()}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {dobError && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {dobError}
              </p>
            )}
          </div>

          {/* ---------------- 성별 ---------------- */}
          <div className="space-y-1">
            <label className="font-medium text-sm text-gray-700">성별</label>

            <div className="flex gap-2">
              {[
                { value: 'FEMALE', label: '여자' },
                { value: 'MALE', label: '남자' },
                { value: 'OTHER', label: '기타' },
              ].map((g) => (
                <button
                  type="button"
                  key={g.value}
                  onClick={() => {
                    setGender(g.value as any);
                    setGenderError('');
                  }}
                  className={`flex-1 h-10 rounded-md border text-sm transition
                    ${
                      gender === g.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600 font-semibold'
                        : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {genderError && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {genderError}
              </p>
            )}
          </div>

          {/* ---------------- FORM ERROR ---------------- */}
          {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}

          {/* ---------------- SUBMIT BUTTON ---------------- */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 bg-[#2979FF] text-white rounded-md font-semibold transition
              ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#1f5edb]'}`}
          >
            {loading ? '가입 중...' : '가입 완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
