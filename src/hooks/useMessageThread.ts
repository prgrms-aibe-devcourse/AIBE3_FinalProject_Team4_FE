import { messagesApi } from '@/src/api/messagesApi';
import { useQuery } from '@tanstack/react-query';

export function useMessageThread(threadId?: number) {
  return useQuery({
    queryKey: ['messageThread', threadId],
    enabled: Boolean(threadId),
    queryFn: () => messagesApi.getThread(threadId!),
  });
}
