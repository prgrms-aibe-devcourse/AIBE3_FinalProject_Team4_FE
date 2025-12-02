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
