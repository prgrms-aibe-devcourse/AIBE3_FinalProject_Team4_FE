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
  relativeTime?: string;
};

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;

  addNotification: (n: NotificationItem) => void;
  setNotifications: (
    list: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[]),
  ) => void;
  markAllAsRead: () => void;

  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  /** SSE로 새 알림 추가 */
  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + (n.isRead ? 0 : 1),
    })),

  /** 알림 목록 전체 세팅 (함수형 업데이트 지원) */
  setNotifications: (list) =>
    set((state) => {
      const newList = typeof list === 'function' ? list(state.notifications) : list;
      const unread = newList.filter((n) => !n.isRead).length;
      return {
        notifications: newList,
        unreadCount: unread,
      };
    }),

  /** 전체 읽음 처리 */
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
      })),
      unreadCount: 0,
    })),

  setUnreadCount: (count: number) =>
    set(() => ({
      unreadCount: count,
    })),
}));
