import { useEffect, useRef } from 'react';

type Props = {
  enabled: boolean;
  onMessage: (data: any) => void;
};

export function useNotificationSSE({ enabled, onMessage }: Props) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/stream`,
      { withCredentials: true } as any,
    );

    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    es.onerror = () => {
      console.error('SSE connection error');
      es.close();
    };

    return () => es.close();
  }, [enabled, onMessage]);
}
