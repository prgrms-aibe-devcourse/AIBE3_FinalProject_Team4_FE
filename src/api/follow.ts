import apiClient from "./clientForRs";
import { FollowCheckResponse } from "../types/follow";

// 팔로우 하기
export async function followUser(followingId: number): Promise<void> {
  return apiClient<void>(`/api/v1/follow/${followingId}`, {
    method: 'POST',
  });
}

// 언팔로우
export async function unfollowUser(unfollowingId: number): Promise<void> {
  return apiClient<void>(`/api/v1/follow/${unfollowingId}`, {
    method: 'DELETE',
  });
}

// 팔로우 여부 확인
export async function fetchIsFollowing(userId: number): Promise<boolean> {
  const data = await apiClient<FollowCheckResponse>(
    `/api/v1/follow/is-following/${userId}`,
    { method: 'GET' }
  );
  return data.isFollowing;
}
