import { messagesApi } from '@/src/api/messagesApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateMessageThread() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (otherUserId: number) => messagesApi.createThread(otherUserId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['messageThreads'] });
    },
  });
}
