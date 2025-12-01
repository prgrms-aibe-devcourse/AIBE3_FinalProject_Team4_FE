import { AiChatRequest, ModelAvailabilityDto } from '@/src/types/ai';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { ApiError, streamAiChat } from './aiChatApi';

interface UseAiChatStreamOptions {
  onChunk?: (chunk: string) => void;
  onMeta?: (meta: ModelAvailabilityDto) => void;
  onComplete?: (fullText: string) => void;
  onError?: (e: unknown) => void;
  /** mutate 호출마다, 이전 진행 중 스트림 자동 abort */
  abortPrevious?: boolean;
}

export function useAiChatStreamMutation(opts?: UseAiChatStreamOptions) {
  const abortRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async (req: AiChatRequest) => {
      // 이전 스트림 자동 취소 옵션
      if (opts?.abortPrevious !== false) {
        abortRef.current?.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      let acc = '';

      const fullText = await streamAiChat(
        req,
        (chunk) => {
          acc += chunk;
          opts?.onChunk?.(chunk);
        },
        {
          signal: controller.signal,
          onComplete: (t) => opts?.onComplete?.(t),
          onMeta: (meta) => opts?.onMeta?.(meta),
          onError: (e) => opts?.onError?.(e),
        },
      );

      return fullText;
    },
    onError: (e) => {
      // 여기서 한 번 더 공통 처리 가능
      if (e instanceof ApiError) {
        console.warn('API Error:', e.status, e.serverMsg || e.message);
      }
      opts?.onError?.(e);
    },
  });

  /** 외부에서 스트리밍 중단할 때 */
  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** 안전하게 새 요청 시작: stop 후 mutate */
  const start = useCallback(
    (req: AiChatRequest) => {
      if (opts?.abortPrevious !== false) {
        abortRef.current?.abort();
      }
      mutation.mutate(req);
    },
    [mutation, opts?.abortPrevious],
  );

  return {
    ...mutation,
    start, // start(req)로 시작
    stop, // stop()으로 중단
    isStreaming: mutation.isPending,
    lastError: mutation.error as unknown,
  };
}
