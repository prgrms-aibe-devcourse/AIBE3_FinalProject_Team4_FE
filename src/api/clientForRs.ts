import type { RsData } from '@/src/types/blog';
import { ApiError } from './ApiError';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function apiClient<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  const config: RequestInit = {
    credentials: 'include',
    ...fetchOptions,
  };

  // FormData가 아니면 JSON 헤더
  if (!(fetchOptions.body instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };
  }

  const res = await fetch(url, config);

  let json: unknown;

  try {
    json = await res.json();
  } catch {
    throw new ApiError(`JSON 파싱 실패`, res.status);
  }

  // RsData 형태
  if (typeof json === 'object' && json && 'resultCode' in json && 'data' in json) {
    const rs = json as RsData<T>;

    if (!res.ok) {
      throw new ApiError(rs.msg, res.status, rs.resultCode);
    }

    return rs.data;
  }

  if (!res.ok) {
    throw new ApiError(`요청 실패 (status: ${res.status})`, res.status);
  }

  return json as T;
}

export default apiClient;
