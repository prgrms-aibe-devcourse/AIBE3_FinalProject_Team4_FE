import type { CreatorOverview } from '../types/dashboard';
import apiClient from './clientForRs';

export async function getCreatorOverview(days: number = 3): Promise<CreatorOverview> {
  return apiClient<CreatorOverview>('/api/v1/creator-dashboard/overview', {
    method: 'GET',
    params: { days: String(days) },
  });
}
