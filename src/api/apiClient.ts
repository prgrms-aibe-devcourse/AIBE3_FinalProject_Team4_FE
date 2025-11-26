const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string>;
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

  // JSON 요청인 경우 Content-Type 헤더 추가
  if (!(fetchOptions.body instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };
  }

  const response = await fetch(url, config);
  return response;
};

export default apiClient;
