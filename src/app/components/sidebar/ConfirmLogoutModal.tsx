'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ConfirmLogoutModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmLogoutModal({ onConfirm, onCancel }: ConfirmLogoutModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 bg-black/40
        flex items-center justify-center
      "
      style={{ zIndex: 9999999 }}
    >
      <div
        className="
          bg-white rounded-xl p-6 w-[380px] shadow-xl relative
        "
        style={{ zIndex: 10000000 }}
      >
        <h2 className="text-xl font-semibold text-center mb-6">로그아웃하시겠습니까?</h2>

        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('취소 버튼 클릭됨');
              onCancel();
            }}
            className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-100"
          >
            취소
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔥 로그아웃 버튼 클릭됨');
              onConfirm();
            }}
            className="flex-1 py-3 rounded-xl border border-red-500 text-red-500 hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
