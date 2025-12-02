import { create } from 'zustand';

export type NotificationItem = {
  id: number;
  senderId: number;
  senderNickname: string;
  senderProfileImage: string | null;
  type: string;
  targetId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationState = {
  notifications: NotificationItem[];

  unreadCount: number;

  addNotification: (n: NotificationItem) => void;

  setNotifications: (list: NotificationItem[]) => void;

  markAsRead: (id: number) => void;

  markAllAsRead: () => void;

  clear: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + (n.isRead ? 0 : 1),
    })),

  setNotifications: (list) =>
    set(() => ({
      notifications: list,
      unreadCount: list.filter((n) => !n.isRead).length,
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.notifications.filter((n) => !n.isRead && n.id !== id).length),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
      })),
      unreadCount: 0,
    })),

  clear: () => set({ notifications: [], unreadCount: 0 }),
}));
