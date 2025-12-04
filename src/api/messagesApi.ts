import apiClient from '@/src/api/clientForRs';
import type {
  CreateMessageThreadResponseDto,
  MessageThreadDetailDto,
  MessageThreadListItemDto,
} from '@/src/types/messageApi';

export const messagesApi = {
  getThreads: () => apiClient<MessageThreadListItemDto[]>('/api/v1/message/threads'),

  getThread: (threadId: number) =>
    apiClient<MessageThreadDetailDto>(`/api/v1/message/threads/${threadId}`),

  // ✅ 생성은 RequestParam: POST /message-threads?otherUserId=xx
  createThread: (otherUserId: number) =>
    apiClient<CreateMessageThreadResponseDto>('/api/v1/message/threads', {
      method: 'POST',
      params: { otherUserId: String(otherUserId) },
    }),

  createThreadWithMe: (meId: number, otherUserId: number) =>
    apiClient<CreateMessageThreadResponseDto>('/api/v1/message/threads', {
      method: 'POST',
      params: { meId: String(meId), otherUserId: String(otherUserId) },
    }),
};

export async function postThreadRead(threadId: number, meId: number, lastMessageId?: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/message-threads/${threadId}/read?meId=${meId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: lastMessageId ? JSON.stringify({ lastMessageId }) : null,
      credentials: 'include',
    },
  );
  if (!res.ok) throw new Error(`read failed: ${res.status}`);
  return res.json();
}
