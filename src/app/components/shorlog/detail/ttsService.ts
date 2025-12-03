'use client';

import { ttsApi, TtsTokenResponse } from '@/src/api/ttsApi';

export type TtsMode = 'ai' | 'web' | 'none';

// TTS 서비스 클래스
export class TtsService {
  // 사용자 TTS 토큰 조회
  static async fetchTokens(): Promise<TtsTokenResponse | null> {
    try {
      const response = await ttsApi.getUserTokens();
      if (response.resultCode === '200-1') {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('토큰 조회 실패:', err);
      return null;
    }
  }

  // AI TTS 생성
  static async generateTts(shorlogId: number): Promise<string | null> {
    try {
      const response = await ttsApi.generateShorlogTts(shorlogId);
      if (response.resultCode === '200-1') {
        return response.data.ttsUrl;
      } else {
        throw new Error(response.msg);
      }
    } catch (err) {
      console.error('AI TTS 생성 실패:', err);
      throw err;
    }
  }

  // 기존 TTS URL 조회
  static async getTtsUrl(shorlogId: number): Promise<string | null> {
    try {
      const response = await ttsApi.getShorlogTts(shorlogId);
      if (response.resultCode === '200-1' && response.data.ttsUrl) {
        return response.data.ttsUrl;
      }
      return null;
    } catch (err) {
      // TTS가 없으면 null 반환
      return null;
    }
  }

  // 토큰 유효성 검사
  static hasValidTokens(tokens: TtsTokenResponse | null): boolean {
    return tokens !== null && tokens.token > 0;
  }
}
