import apiClient from './apiClient';

// TTS 관련 타입 정의 (백엔드 DTO와 일치)
export interface TtsTokenResponse {
  token: number;
  resetDate: string; // LocalDateTime을 string으로 받음
}

export interface TtsResponse {
  ttsUrl: string;
}

export interface TtsUseResponse {
  success: boolean;
  remainingToken: number;
}

// TTS 관련 API 클라이언트
export const ttsApi = {
  // 사용자 TTS 토큰 조회
  getUserTokens: async (): Promise<{ resultCode: string; msg: string; data: TtsTokenResponse }> => {
    const response = await apiClient('/api/v1/user/tts/token', {
      method: 'GET',
    });
    return response.json();
  },

  // TTS 토큰 차감
  useTokens: async (amount: number): Promise<{ resultCode: string; msg: string; data: TtsUseResponse }> => {
    const response = await apiClient(`/api/v1/user/tts/use?amount=${amount}`, {
      method: 'POST',
    });
    return response.json();
  },

  // 숏로그 TTS 생성
  generateShorlogTts: async (shorlogId: number): Promise<{ resultCode: string; msg: string; data: TtsResponse }> => {
    const response = await apiClient(`/api/v1/shorlog/${shorlogId}/tts`, {
      method: 'POST',
    });
    return response.json();
  },

  // 숏로그 TTS URL 조회
  getShorlogTts: async (shorlogId: number): Promise<{ resultCode: string; msg: string; data: TtsResponse }> => {
    const response = await apiClient(`/api/v1/shorlog/${shorlogId}/tts`, {
      method: 'GET',
    });
    return response.json();
  },
};
