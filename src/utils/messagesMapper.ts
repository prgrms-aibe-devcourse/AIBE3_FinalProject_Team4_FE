import type {
  MessageDto,
  MessageThreadDetailDto,
  MessageThreadListItemDto,
} from '@/src/types/messageApi';
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
    unreadCount: dto.unreadCount ?? 0,
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

export function mapMessageDtoToChatMessage(dto: MessageDto, myId: number): ChatMessage {
  return {
    id: String(dto.id),
    sender: dto.senderId === myId ? 'me' : 'them',
    text: dto.content,
    at: dto.createdAt, // 나중에 포맷팅은 UI에서
  };
}
