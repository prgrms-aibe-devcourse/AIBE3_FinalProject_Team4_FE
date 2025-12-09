'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { X } from 'lucide-react';
import Link from 'next/link';

// ⭐ 추가: 모달 import
import ConfirmLogoutModal from '../ConfirmLogoutModal';

export default function MorePanel({
  onClose,
  showLogoutModal,
  setShowLogoutModal,
}: {
  onClose: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (value: boolean) => void;
}) {
  const { isLogin, logout } = useAuth();
  const { open } = useLoginModal();

  const handleLogout = async () => {
    console.log('로그아웃 처리');
    await logout();
    setShowLogoutModal(false);
    onClose();
  };

  return (
    <>
      <div
        className="
          fixed left-20 top-0 
          w-80 h-screen 
          bg-white border-r border-gray-200 
          shadow-md 
          animate-slideIn 
          z-[110]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8 h-16">
          <h2 className="text-xl font-semibold">더보기</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        {/* List */}
        <div className="px-3 py-1 space-y-1 text-[15px]">
          <button
            className="
              w-full text-left font-semibold 
              py-2 px-2 rounded-lg 
              hover:bg-gray-100 transition
            "
          >
            설정 및 개인정보
          </button>

          <button
            className="
              w-full text-left font-semibold 
              py-2 px-2 rounded-lg 
              hover:bg-gray-100 transition
            "
          >
            다크모드 (개발중)
          </button>

          {/* ✅ 로그인 상태: 로그아웃 */}
          {isLogin ? (
            <button
              onClick={() => {
                console.log('로그아웃 모달 열기');
                setShowLogoutModal(true);
              }}
              className="
                w-full text-left font-semibold 
                py-2 px-2 rounded-lg 
                hover:bg-gray-100 transition
              "
            >
              로그아웃
            </button>
          ) : (
            <>
              {/* ✅ 로그아웃 상태: 로그인 / 회원가입 */}
              <button
                onClick={() => {
                  onClose(); // 패널 먼저 닫고
                  open(); // 로그인 모달 열기
                }}
                className="
                  w-full text-left font-semibold 
                  py-2 px-2 rounded-lg 
                  hover:bg-gray-100 transition
                "
              >
                로그인
              </button>

              <Link
                href="/auth/register"
                onClick={() => onClose()}
                className="
                  block w-full text-left font-semibold 
                  py-2 px-2 rounded-lg 
                  hover:bg-gray-100 transition
                "
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>

      {showLogoutModal && (
        <ConfirmLogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      )}
    </>
  );
}
