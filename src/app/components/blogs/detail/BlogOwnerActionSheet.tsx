'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type BlogOwnerActionSheetProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onConnectShorlog: () => void;
};

export function BlogOwnerActionSheet({
  open,
  onClose,
  onDelete,
  onEdit,
  onConnectShorlog,
}: BlogOwnerActionSheetProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        {/* 배경 오버레이 */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* 가운데 카드 (모바일은 살짝 아래쪽에 둔 액션시트 느낌) */}
        <div className="fixed inset-0 flex items-end justify-center pb-8 sm:items-center sm:pb-0">
          <Transition.Child
            as={Fragment}
            enter="transform transition duration-200 ease-out"
            enterFrom="translate-y-8 opacity-0 sm:translate-y-0 sm:scale-95"
            enterTo="translate-y-0 opacity-100 sm:scale-100"
            leave="transform transition duration-150 ease-in"
            leaveFrom="translate-y-0 opacity-100 sm:scale-100"
            leaveTo="translate-y-8 opacity-0 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm overflow-hidden rounded-3xl bg-white text-center shadow-xl ring-1 ring-slate-200">
              {/* 숏로그와 연결 */}
              <button
                type="button"
                className="flex w-full items-center justify-center border-b border-slate-100 px-4 py-3.5 text-sm text-slate-800 hover:bg-slate-50"
                onClick={() => {
                  onConnectShorlog();
                  onClose();
                }}
              >
                숏로그와 연결
              </button>

              {/* 수정 */}
              <button
                type="button"
                className="flex w-full items-center justify-center border-b border-slate-100 px-4 py-3.5 text-sm text-slate-800 hover:bg-slate-50"
                onClick={() => {
                  onEdit();
                  onClose();
                }}
              >
                수정
              </button>
              
              {/* 삭제 (빨간색) */}
              <button
                type="button"
                className="flex w-full items-center justify-center border-b border-slate-100 px-4 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
              >
                삭제
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
