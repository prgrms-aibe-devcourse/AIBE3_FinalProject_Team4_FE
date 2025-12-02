import apiClient from './clientForRs';

type MeResponse = {
  id: number;
  username: string;
  nickname: string;
};

export async function fetchMe(): Promise<MeResponse> {
  return apiClient<MeResponse>('/api/v1/users/me', {
    method: 'GET',
  });
}
