import { MainSummary } from '../types/main';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  resultCode: string;
  msg: string;
  data: T;
}

export async function fetchMainSummary(): Promise<MainSummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/main/summary`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json: ApiResponse<MainSummary> = await res.json();

    // resultCode 체크 (선택사항이지만 권장)
    if (!json.resultCode.startsWith('200')) {
      throw new Error(json.msg || '메인 데이터를 불러오지 못했습니다.');
    }

    return json.data;
  } catch (error) {
    console.error('메인 데이터 로딩 실패:', error);
    throw error;
  }
}
