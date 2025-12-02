'use client';

import { showGlobalToast } from '@/src/lib/toastStore';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: { id: number; nickname: string; bio: string; profileImgUrl: string };
  onSave?: () => void;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type NicknameStatus = 'idle' | 'checking' | 'valid' | 'invalid';

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#2979FF]"
      aria-hidden
    />
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M16.5 5.8l-7.4 8-3.6-3.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M10 2.8l8 14H2l8-14z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 7v4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 14.7h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileEditModalProps) {
  const defaultImage = '/tmpProfile.png';
  const nicknameTimer = useRef<NodeJS.Timeout | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [preview, setPreview] = useState(profile.profileImgUrl || defaultImage);
  const [file, setFile] = useState<File | null>(null);
  const [deleted, setDeleted] = useState(false);

  const [status, setStatus] = useState<NicknameStatus>('idle');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [bioError, setBioError] = useState('');

  const nicknameChanged = nickname !== profile.nickname;
  const bioMax = 100;

  const nicknameMeta = useMemo(() => {
    const len = nickname.length;
    const inRange = len >= 4 && len <= 30;
    return { len, inRange };
  }, [nickname]);

  const MAX_BIO_LINES = 4;

  const clampBioToMaxLines = (text: string) => {
    const lines = text.split(/\r\n|\r|\n/);
    return lines.slice(0, MAX_BIO_LINES).join('\n');
  };

  const countLines = (text: string) => text.split(/\r\n|\r|\n/).length;

  useEffect(() => {
    if (!isOpen) return;
    setNickname(profile.nickname);
    setBio(profile.bio ?? '');
    setPreview(profile.profileImgUrl || defaultImage);
    setFile(null);
    setDeleted(false);
    setStatus('idle');
    setError('');
  }, [isOpen, profile.nickname, profile.bio, profile.profileImgUrl]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    setTimeout(() => dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const checkNickname = async (v: string) => {
    try {
      const res = await fetch(
        `${API}/api/v1/users/check-nickname?nickname=${encodeURIComponent(v)}`,
      );
      const json = await res.json();

      const ok = json.resultCode === '200';
      setStatus(ok ? 'valid' : 'invalid');

      const msg = ok ? '' : (json.msg ?? '이미 사용 중인 닉네임이에요.');
      setError(msg);

      if (!ok) showGlobalToast(msg || '닉네임을 확인해 주세요.', 'error');
    } catch {
      setStatus('invalid');
      setError('서버 오류가 발생했어요.');
      showGlobalToast('서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.', 'error');
    }
  };

  // 공백 금지
  const onNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const noSpace = raw.replace(/\s/g, '');
    setNickname(noSpace);

    if (noSpace.length < 4 || noSpace.length > 30) {
      setStatus('invalid');
      setError('닉네임은 4~30자여야 해요.');
      return;
    }

    if (noSpace === profile.nickname) {
      setStatus('idle');
      setError('');
      return;
    }

    setStatus('checking');
    setError('');

    if (nicknameTimer.current) clearTimeout(nicknameTimer.current);
    nicknameTimer.current = setTimeout(() => checkNickname(noSpace), 350);
  };

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setDeleted(false);
    setFile(f);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const onDelete = () => {
    setPreview(defaultImage);
    setFile(null);
    setDeleted(true);
  };

  const canSave = !saving && nicknameMeta.inRange && status !== 'invalid' && status !== 'checking';

  const onSaveProfile = async () => {
    if (!nicknameMeta.inRange) return showGlobalToast('닉네임은 4~30자여야 해요.', 'error');
    if (status === 'invalid') return showGlobalToast(error || '닉네임이 유효하지 않아요.', 'error');
    if (status === 'checking')
      return showGlobalToast('닉네임 확인 중이에요. 잠시만 기다려 주세요.', 'warning');

    setSaving(true);

    const dto = { nickname, bio, deleteExistingImage: deleted };
    const form = new FormData();
    form.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (file && !deleted) form.append('profileImage', file);

    try {
      const res = await fetch(`${API}/api/v1/users/update`, {
        method: 'PUT',
        credentials: 'include',
        body: form,
      });
      const json = await res.json();

      if (json.resultCode === '200') {
        showGlobalToast('프로필이 저장되었어요.', 'success');
        onSave?.();
        onClose();
      } else {
        showGlobalToast(json.msg || '수정에 실패했어요.', 'error');
      }
    } catch {
      showGlobalToast('네트워크 오류가 발생했어요. 다시 시도해 주세요.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop: 프로필 페이지가 밝아서 오버레이도 과하지 않게 */}
      <button
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="모달 닫기(배경)"
        type="button"
      />

      {/* Modal shell: glass 제거 + 플랫 화이트 카드 */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200"
      >
        {/* Header: 얇은 보더 + 같은 톤 */}
        {/* Header (FollowModal 스타일) */}
        <div className="flex items-center justify-center px-4 py-5 relative flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900">프로필 편집</h2>
          <button
            onClick={onClose}
            className="absolute right-7 text-2xl text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF] focus-visible:ring-offset-2 rounded-md"
            aria-label="닫기"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="space-y-5">
            {/* 이미지 섹션: 페이지가 플랫하니 섹션 박스도 최소 */}
            {/* Profile photo section: TikTok-ish */}
            <div className="relative min-h-[120px] py-6">
              {/* Avatar (진짜 정중앙 고정) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="h-28 w-28 overflow-hidden rounded-full bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="프로필 이미지 미리보기"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <label className="absolute -bottom-1 -right-1 inline-flex cursor-pointer items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200 hover:bg-slate-50">
                    <span className="flex h-8 w-8 items-center justify-center" aria-hidden>
                      ✎
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onUpload}
                      aria-label="프로필 이미지 업로드"
                    />
                  </label>
                </div>
              </div>

              {/* Right action (세로 중앙 정렬) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={preview === defaultImage}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
                  aria-label="프로필 이미지 삭제"
                >
                  삭제
                </button>
              </div>
            </div>

            {/* 닉네임 */}
            <section className="space-y-2">
              <div className="flex items-end justify-between">
                <label className="text-sm font-semibold text-slate-900">닉네임</label>
                <span className="text-xs text-slate-500">{nicknameMeta.len}/30</span>
              </div>

              <div className="relative">
                <input
                  value={nickname}
                  onChange={onNickname}
                  maxLength={30}
                  placeholder="4~30자"
                  className={[
                    'w-full rounded-lg border bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 outline-none',
                    'placeholder:text-slate-400',
                    'focus-visible:ring-2 focus-visible:ring-[#2979FF]',
                  ].join(' ')}
                  aria-label="닉네임"
                  autoCapitalize="off"
                  autoCorrect="off"
                />

                <div className="absolute inset-y-0 right-2 flex items-center">
                  {status === 'checking' && <Spinner />}
                  {status === 'valid' && nicknameChanged && (
                    <span className="text-emerald-600" aria-label="사용 가능" title="사용 가능">
                      <CheckIcon />
                    </span>
                  )}
                  {status === 'invalid' && (
                    <span className="text-red-600" aria-label="사용 불가" title="사용 불가">
                      <AlertIcon />
                    </span>
                  )}
                </div>
              </div>

              <div className="min-h-[18px] text-[13px]">
                {status === 'checking' && <p className="text-slate-500">확인 중…</p>}
                {error && status === 'invalid' && <p className="text-red-600">{error}</p>}
                {!error && status === 'valid' && nicknameChanged && (
                  <p className="text-emerald-600">사용 가능한 닉네임이에요.</p>
                )}
              </div>
            </section>

            {/* 자기소개 */}
            <section className="space-y-2">
              <div className="flex items-end justify-between">
                <label className="text-sm font-semibold text-slate-900">자기소개</label>
                <span className="text-xs text-slate-500">
                  {bio.length}/{bioMax}
                </span>
              </div>

              <textarea
                value={bio}
                onChange={(e) => setBio(clampBioToMaxLines(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  const lines = bio.split(/\r\n|\r|\n/).length;
                  if (lines >= MAX_BIO_LINES) {
                    e.preventDefault();
                    setBioError('자기소개는 최대 4줄까지 입력할 수 있어요.');
                  }
                }}
                maxLength={bioMax}
                rows={4}
                placeholder="짧고 선명하게 소개해보세요."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#2979FF] focus-visible:ring-offset-2"
                aria-label="자기소개"
              />
            </section>
          </div>
        </div>

        {/* Footer: 페이지 느낌처럼 플랫 */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF] focus-visible:ring-offset-2"
            type="button"
          >
            취소
          </button>

          <button
            disabled={!canSave}
            onClick={onSaveProfile}
            className={[
              'rounded-lg px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF] focus-visible:ring-offset-2',
              canSave ? 'bg-[#2979FF] hover:brightness-95' : 'cursor-not-allowed bg-slate-300',
            ].join(' ')}
            type="button"
            aria-label="저장"
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
