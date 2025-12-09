// useMessageThreads.ts
import { messagesApi } from '@/src/api/messagesApi';
import type { MessageThread } from '@/src/types/messages';
import { mapThreadListItem } from '@/src/utils/messagesMapper';
import { useQuery } from '@tanstack/react-query';

export function useMessageThreads(enabled = true) {
  return useQuery<MessageThread[]>({
    queryKey: ['messageThreads'],
    enabled,
    queryFn: async () => {
      const list = await messagesApi.getThreads();
      return list.map(mapThreadListItem);
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
  });
}
