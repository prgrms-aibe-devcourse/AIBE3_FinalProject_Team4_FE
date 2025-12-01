import { AiChatRequest, ModelAvailabilityDto } from '@/src/types/ai';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface RsData<T> {
  resultCode: string;
  msg: string;
  data: T;
}

// UI에서 구분해서 쓰기 쉬운 커스텀 에러
export class ApiError extends Error {
  status: number;
  resultCode?: string;
  serverMsg?: string;
  bodyText?: string;

  constructor(
    message: string,
    status: number,
    extra?: {
      resultCode?: string;
      serverMsg?: string;
      bodyText?: string;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.resultCode = extra?.resultCode;
    this.serverMsg = extra?.serverMsg;
    this.bodyText = extra?.bodyText;
  }
}

// 응답 에러 바디를 최대한 RsData로 파싱
async function parseErrorResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  let bodyText = '';

  try {
    bodyText = await res.text(); // 스트리밍 실패 케이스도 있으니 text로 먼저
  } catch {
    bodyText = '';
  }

  // RsData 형태 JSON이면 msg/resultCode 뽑기
  if (contentType.includes('application/json') && bodyText) {
    try {
      const json = JSON.parse(bodyText) as Partial<RsData<any>>;
      return {
        resultCode: json.resultCode,
        serverMsg: json.msg,
        bodyText,
      };
    } catch {
      // fallthrough
    }
  }

  return { bodyText };
}

// 스트리밍 응답에서 RsData<String>의 data를 계속 뽑아 콜백으로 전달
export async function streamAiChat(
  req: AiChatRequest,
  onChunk: (chunk: string, rs?: RsData<string>) => void,
  options?: {
    signal?: AbortSignal;
    onError?: (e: unknown) => void;
    onComplete?: (fullText: string) => void;
    onMeta?: (meta: ModelAvailabilityDto) => void;
  },
) {
  const controller = new AbortController();
  const signal = options?.signal ?? controller.signal;

  let fullText = '';

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/ais/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream, application/json',
      },
      body: JSON.stringify({
        id: req.id ?? 'temp',
        message: req.message,
        content: req.content,
        model: req.model,
      }),
      signal,
    });

    if (!res.ok) {
      const extra = await parseErrorResponse(res);

      // ✅ 상태코드별 사용자 친화 메시지
      const friendly =
        res.status === 401
          ? '로그인이 필요해요.'
          : res.status === 403
            ? '접근 권한이 없어요.'
            : res.status >= 500
              ? '서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
              : '요청에 실패했어요.';

      throw new ApiError(extra.serverMsg || friendly, res.status, extra);
    }

    if (!res.body) {
      throw new Error('스트리밍을 지원하지 않는 응답이에요.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, '\n');

      // ---- 1) SSE 이벤트 단위(\n\n) 우선 파싱 ----
      // SSE는 보통: "data: {...}\n\n"
      const sseEvents = buffer.split('\n\n');
      buffer = sseEvents.pop() ?? ''; // 마지막은 미완성일 수 있음

      for (const evt of sseEvents) {
        const lines = evt.split('\n');

        let currentEvent: 'chunk' | 'meta' | string = 'chunk';
        let dataLines: string[] = [];

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // data: 로 시작하면 SSE
          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.replace(/^event:\s*/, '');
          } else if (trimmed.startsWith('data:')) {
            dataLines.push(trimmed.replace(/^data:\s*/, ''));
          }
          // if (trimmed.startsWith('data:')) {
          //   const payload = trimmed.replace(/^data:\s*/, '');
          //   handlePayload(payload);
          // } else {
          //   // SSE가 아니면 그냥 라인(JSON일 수도)
          //   handlePayload(trimmed);
          // }
        }

        const payload = dataLines.join('\n').trim();
        if (!payload) continue;

        handlePayload(payload, currentEvent);
      }
    }

    // 스트림 끝났는데 buffer에 남아있으면 SSE 방식으로 한 번 더 파싱
    if (buffer.trim()) {
      const tailEvents = buffer.split('\n\n');

      for (const evt of tailEvents) {
        const lines = evt.split('\n');

        let currentEvent: 'chunk' | 'meta' | string = 'chunk';
        let dataLines: string[] = [];

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.replace(/^event:\s*/, '');
          } else if (trimmed.startsWith('data:')) {
            dataLines.push(trimmed.replace(/^data:\s*/, ''));
          }
        }

        const payload = dataLines.join('\n').trim();
        if (!payload) continue;

        handlePayload(payload, currentEvent);
      }
    }

    options?.onComplete?.(fullText);
    return fullText;

    // ---- 내부 헬퍼 ----
    function handlePayload(payload: string, ev: string) {
      // payload가 "[DONE]" 같은 종료 토큰일 수도 있음
      if (payload === '[DONE]') return;

      // JSON 파싱 시도
      try {
        const rs: RsData<any> = JSON.parse(payload);
        const data = rs.data;

        if (ev === 'meta') {
          // 모델 사용 가능 여부 메타정보 콜백
          options?.onMeta?.(data as ModelAvailabilityDto);
          return;
        }

        // 일반 청크 데이터
        const chunk = String(data ?? '');
        if (chunk) {
          fullText += chunk;
          onChunk(chunk, rs);
        }
        return;
      } catch {
        // JSON이 아니면 그냥 텍스트로 취급
        if (payload) {
          fullText += payload;
          onChunk(payload);
        }
      }
    }
  } catch (e) {
    options?.onError?.(e);
    throw e;
  }
}
