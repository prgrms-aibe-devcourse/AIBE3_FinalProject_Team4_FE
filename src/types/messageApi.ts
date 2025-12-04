export type MessageThreadListItemDto = {
  messageThreadId: number;
  otherUserId: number;
  otherUserNickname: string;
  otherUserProfileImgUrl: string | null;
  lastMessageContent: string | null;
  lastMessageCreatedAt: string | null;
  unreadCount?: number;
};

export type MessageDto = {
  id: number;
  senderId: number;
  senderNickname: string;
  profileImgUrl: string | null;
  content: string;
  createdAt: string;
};

export type MessageThreadDetailDto = {
  messageThreadId: number;
  otherUserId: number;
  otherUserNickname: string;
  otherUserProfileImgUrl: string | null;
  messages: MessageDto[];
};

export type CreateMessageThreadResponseDto = {
  messageThreadId: number;
  otherUserId: number;
  otherUserNickname: string;
  otherUserProfileImgUrl: string | null;
};
