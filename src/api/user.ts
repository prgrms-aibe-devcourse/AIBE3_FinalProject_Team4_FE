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

export async function withdraw(): Promise<void> {
  await apiClient('/api/v1/auth/withdraw', {
    method: 'DELETE',
  });
}
