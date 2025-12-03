import type { MessageThreadDetailDto, MessageThreadListItemDto } from '@/src/types/message';
import type { ChatMessage, MessageThread } from '@/src/types/messages';

export function mapThreadListItem(dto: MessageThreadListItemDto): MessageThread {
  return {
    id: String(dto.messageThreadId),
    user: {
      id: String(dto.otherUserId),
      name: dto.otherUserNickname,
      avatarUrl: dto.otherUserProfileImgUrl ?? undefined,
    },
    lastMessage: dto.lastMessageContent ?? '',
    lastAt: dto.lastMessageCreatedAt ?? '',
    unreadCount: 0,
    messages: [],
  };
}

export function mapDetailMessages(detail: MessageThreadDetailDto, myUserId: number): ChatMessage[] {
  return detail.messages.map((m) => ({
    id: String(m.id),
    sender: m.senderId === myUserId ? 'me' : 'them',
    text: m.content,
    at: m.createdAt,
  }));
}
