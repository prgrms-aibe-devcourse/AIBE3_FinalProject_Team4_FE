import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export function createStompClient() {
  return new Client({
    webSocketFactory: () => new SockJS(`${BASE}/ws`),
    reconnectDelay: 3000,
    debug: () => {},
  });
}
