import { messagesApi } from '@/src/api/messagesApi';
import { useQuery } from '@tanstack/react-query';
import { MessageThreadResponseDto } from '../types/messageApi';

export function useMessageThread(threadId?: number) {
  return useQuery<MessageThreadResponseDto>({
    queryKey: ['messageThread', threadId],
    enabled: Boolean(threadId),
    queryFn: () => messagesApi.getThread(threadId!),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
  });
}
