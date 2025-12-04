'use client';

import { useEffect, useState } from 'react';
import { subscribeToast, Toast } from '@/src/lib/toastStore';

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToast(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg px-4 py-2 text-sm text-white shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'warning'
                ? 'bg-orange-400'
                : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}