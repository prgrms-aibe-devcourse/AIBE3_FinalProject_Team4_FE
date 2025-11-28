// components/profile/ProfileEditModal.tsx
'use client';

import { ChangeEvent, useState } from 'react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: number;
    nickname: string;
    bio: string;
    profileImgUrl: string;
  };
  onSave?: () => void; // 저장 후 새로고침 또는 리렌더용 콜백
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProfileEditModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileEditModalProps) {
  if (!isOpen) return null;

  // 상태
  const [newNickname, setNewNickname] = useState(profile.nickname);
  const [newBio, setNewBio] = useState(profile.bio ?? '');
  const [profileImagePreview, setProfileImagePreview] = useState(
    profile.profileImgUrl || '/tmpProfile.png',
  );
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  /** 🔵 이미지 업로드 핸들러 */
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);

    const reader = new FileReader();
    reader.onload = () => setProfileImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /** 🔥 저장 요청 */
  const handleSaveProfile = async () => {
    setSaving(true);

    const formData = new FormData();
    formData.append('nickname', newNickname);
    formData.append('bio', newBio);

    if (uploadFile) {
      formData.append('profileImg', uploadFile);
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/users/update`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    const json = await res.json();

    setSaving(false);

    if (json.resultCode === '200') {
      alert('프로필이 수정되었습니다.');

      if (onSave) onSave();
      else window.location.reload();

      onClose();
    } else {
      alert(json.message || '프로필 수정 실패');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-xl overflow-hidden">
        {/* ---------------- 헤더 ---------------- */}
        <div className="flex justify-center items-center py-5 border-b relative">
          <h2 className="text-2xl font-bold">프로필 편집</h2>
          <button
            onClick={onClose}
            className="absolute right-5 text-2xl text-slate-500 hover:text-slate-900"
          >
            ✕
          </button>
        </div>

        {/* ---------------- 본문 ---------------- */}
        <div className="px-8 py-6 space-y-6">
          {/* 프로필 사진 */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-lg font-medium">프로필 사진</span>

            <div className="relative">
              <img
                src={profileImagePreview}
                className="w-36 h-36 rounded-full object-cover bg-slate-200"
              />
              <label className="absolute bottom-2 right-2 bg-white shadow px-2 py-1 rounded-full cursor-pointer text-sm">
                ✎
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* 닉네임 */}
          <div className="space-y-1">
            <label className="text-sm font-semibold">닉네임</label>
            <input
              value={newNickname}
              maxLength={20}
              onChange={(e) => setNewNickname(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* 자기소개 */}
          <div className="space-y-1">
            <label className="text-sm font-semibold">자기소개</label>
            <textarea
              value={newBio}
              maxLength={100}
              onChange={(e) => setNewBio(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 resize-none"
            ></textarea>
            <div className="text-right text-xs text-slate-400">{newBio.length}/100</div>
          </div>
        </div>

        {/* ---------------- 버튼 영역 ---------------- */}
        <div className="flex justify-end gap-3 px-8 py-4 border-t bg-slate-50">
          <button onClick={onClose} className="px-6 py-2 rounded-md bg-slate-200 text-slate-700">
            취소
          </button>

          <button
            disabled={saving}
            onClick={handleSaveProfile}
            className="px-6 py-2 rounded-md bg-[#2979FF] hover:bg-[#1f62cc] text-white disabled:opacity-50"
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
