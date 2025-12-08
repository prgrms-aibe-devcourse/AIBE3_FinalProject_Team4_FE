import { create } from 'zustand';

interface MessagesUnreadStore {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  incUnread: (by?: number) => void; // ✅ 추가
  reset: () => void; // (선택) 있으면 편함
}

export const useMessagesUnreadStore = create<MessagesUnreadStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  incUnread: (by = 1) => set((s) => ({ unreadCount: Math.max(0, (s.unreadCount ?? 0) + by) })),
  reset: () => set({ unreadCount: 0 }),
}));
