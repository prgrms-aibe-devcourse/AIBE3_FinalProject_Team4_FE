import { cookies } from 'next/headers';
import type { RsData } from '@/src/types/blog';
import { ApiError } from './ApiError';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClientServer<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  // 쿼리 스트링 처리
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // "name=value; name2=value2" 형식으로 쿠키 헤더 생성
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      // FormData가 아니면 JSON 헤더
      ...(fetchOptions.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(fetchOptions.headers || {}),
      // 쿠키가 있으면 Cookie 헤더로 백엔드에 전달
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: 'no-store', // SSR에서 항상 최신 데이터
  };

  const res = await fetch(url, config);

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(`JSON 파싱 실패`, res.status);
  }

  // RsData<T> 형태 처리
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
