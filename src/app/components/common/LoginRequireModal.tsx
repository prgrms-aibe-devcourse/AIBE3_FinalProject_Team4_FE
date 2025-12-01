'use client';

import React from 'react';

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmLogin: () => void;
}

export function LoginRequiredModal({ open, onClose, onConfirmLogin }: LoginRequiredModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900">로그인이 필요한 서비스입니다</h2>
        <p className="mt-2 text-sm text-slate-600">
          기능을 사용하려면 로그인이 필요해요. 
          로그인 페이지로 이동하시겠어요?
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            나중에 할게요
          </button>
          <button
            type="button"
            onClick={onConfirmLogin}
            className="rounded-full bg-[#2979FF] px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[#256ce0]"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
