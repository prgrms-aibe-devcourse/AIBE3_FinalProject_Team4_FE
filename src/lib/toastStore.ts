export type ToastType = 'success' | 'error' | 'warning';

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let listeners: Listener[] = [];
let idSeq = 1;

export function showGlobalToast(message: string, type: ToastType = 'success') {
  const toast: Toast = { id: idSeq++, message, type };

  // 상태 갱신
  toasts = [...toasts, toast];
  listeners.forEach((l) => l(toasts));

  // 3초 뒤 자동 제거
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== toast.id);
    listeners.forEach((l) => l(toasts));
  }, 3000);
}

export function subscribeToast(listener: Listener) {
  listeners.push(listener);
  // 현재 상태 한 번 넘겨주기
  listener(toasts);

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
