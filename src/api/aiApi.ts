import { ModelAvailabilityDto } from '../types/ai';
import apiClient from './apiClient';

// 실제 응답 타입: { resultCode: string; msg: string; data: ModelAvailabilityDto[] }
export interface ModelAvailabilityResponse {
  resultCode: string;
  msg: string;
  data: ModelAvailabilityDto[];
}

export const fetchModelAvailability = async (): Promise<ModelAvailabilityResponse> => {
  const response = await apiClient('/api/v1/ais/model', {
    method: 'GET',
  });
  if (!response.ok) throw new Error('모델 정보를 불러오지 못했습니다.');
  return response.json();
};
