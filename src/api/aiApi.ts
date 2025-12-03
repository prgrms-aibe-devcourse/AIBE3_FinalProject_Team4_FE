import type {
  AiGenerateMultiResults,
  AiGenerateRequest,
  AiGenerateSummaryResult,
} from '@/src/types/ai';
import { ModelAvailabilityDto } from '../types/ai';
import type { RsData } from '../types/blog';
import apiClient from './apiClient';

// ================== AI 생성(추천/요약/제목/키워드) 요청 ==================
export async function fetchAiGenerate(
  body: AiGenerateRequest,
): Promise<RsData<AiGenerateMultiResults | AiGenerateSummaryResult>> {
  const response = await apiClient('/api/v1/ais', {
    method: 'POST',
    body,
  });
  if (!response.ok) throw new Error('AI 생성 요청 실패');
  return response.json();
}

// ================== AI 모델 사용 가능 여부 조회 ==================
export const fetchModelAvailability = async (): Promise<RsData<ModelAvailabilityDto[]>> => {
  const response = await apiClient('/api/v1/ais/model', {
    method: 'GET',
  });

  if (!response.ok) throw new Error('모델 정보를 불러오지 못했습니다.');

  return response.json();
};

// 백엔드 AiGenerateSingleResultResponse가 RsData로 감싸진 형태
export interface AiGenerateSingleResponse {
  resultCode: string;
  msg: string;
  data: {
    result: string;
  };
}

// 백엔드 AiGenerateMultiResultsResponse가 RsData로 감싸진 형태
export interface AiGenerateMultiResponse {
  resultCode: string;
  msg: string;
  data: {
    results: string[];
  };
}

export const generateAiContent = async (
  request: AiGenerateRequest,
): Promise<AiGenerateSingleResponse | AiGenerateMultiResponse> => {
  console.log('AI 요청:', request); // 디버깅용

  const response = await apiClient('/api/v1/ais', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API 오류:', response.status, errorText);
    throw new Error(`AI 콘텐츠 생성 실패: ${response.status}`);
  }

  const result = await response.json();
  console.log('AI 원본 응답:', result); // 디버깅용
  return result;
};
