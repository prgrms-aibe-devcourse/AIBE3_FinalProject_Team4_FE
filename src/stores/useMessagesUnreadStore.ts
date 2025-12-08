import { create } from 'zustand';

type State = {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  reset: () => void;
};

export const useMessagesUnreadStore = create<State>((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: Math.max(0, n) }),
  reset: () => set({ unreadCount: 0 }),
}));
