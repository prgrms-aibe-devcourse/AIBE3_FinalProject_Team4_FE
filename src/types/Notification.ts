export interface NotificationItem {
  id: number;
  senderId: number;
  senderNickname: string;
  senderProfileImage: string | null;
  type: string;
  targetId: number;
  message: string;
  isRead: boolean;
  relativeTime: string;
  createdAt: string;
  redirectUrl: string;
}
