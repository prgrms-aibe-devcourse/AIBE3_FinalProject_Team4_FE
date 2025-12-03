const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string>;
  body?: any; // 객체든 string이든 FormData든 다 받음
}

const apiClient = async (endpoint: string, options: ApiRequestOptions = {}) => {
  const { params, ...fetchOptions } = options;

  // URL 생성
  let url = `${API_BASE_URL}${endpoint}`;

  // Query parameters 추가
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  // 기본 설정
  const config: RequestInit = {
    credentials: 'include', // HttpOnly 쿠키 자동 포함
    ...fetchOptions,
  };

  // body가 있고 FormData가 아니면 JSON 처리
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    const body = fetchOptions.body;

    config.body = typeof body === 'string' ? body : JSON.stringify(body);

    config.headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };
  }

  const response = await fetch(url, config);
  return response;
};

export default apiClient;
