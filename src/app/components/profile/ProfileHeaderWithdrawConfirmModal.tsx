'use client';

interface ProfileHeaderWithdrawConfirmModalProps {
  isOpen: boolean;
  withdrawing: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ProfileHeaderWithdrawConfirmModal({
  isOpen,
  withdrawing,
  errorMessage,
  onClose,
  onConfirm,
}: ProfileHeaderWithdrawConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[92%] max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold text-red-600">정말 탈퇴할까요?</h2>
        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
          계정과 관련된 모든 데이터가 삭제되며 복구할 수 없어요.
        </p>

        {errorMessage && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => {
              if (withdrawing) return;
              onClose();
            }}
            className="h-11 flex-1 rounded-xl border border-slate-300 font-medium hover:bg-slate-50 disabled:opacity-60"
            disabled={withdrawing}
          >
            취소
          </button>

          <button
            onClick={onConfirm}
            className="h-11 flex-1 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
            disabled={withdrawing}
          >
            {withdrawing ? '탈퇴 처리중...' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
