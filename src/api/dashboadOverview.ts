import apiClient from './clientForRs';
import type { CreatorOverview } from '../types/dashboard';

export interface CreatorOverviewDto extends CreatorOverview {} // 타입 그냥 재사용해도 됨
// 일단 3일로 함 프론트엔 7일로 표시
export async function getCreatorOverview(days: number = 3): Promise<CreatorOverview> {
  return apiClient<CreatorOverview>('/api/v1/creator-dashboard/overview', {
    method: 'GET',
    params: {
      days: String(days),
    },
  });
}
