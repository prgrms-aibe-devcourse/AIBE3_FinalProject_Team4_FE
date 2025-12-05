import apiClient from '@/src/api/clientForRs';

export type FollowingUserDto = {
  id: number;
  nickname: string;
  handle?: string | null;
  profileImgUrl?: string | null;
};

// ✅ 서버 응답 형태에 맞게 바꿔주면 됨
export async function fetchFollowingUsers(params: {
  meId: number;
  q?: string;
}): Promise<FollowingUserDto[]> {
  // 예시 endpoint (너희 서버에 맞게 수정)
  // GET /users/{meId}/following?q=...
  const res = await apiClient<FollowingUserDto[]>(`/api/v1/follow/followings/${params.meId}`, {
    method: 'GET',
    params: params.q ? { q: params.q } : undefined,
  });

  return res;
}
