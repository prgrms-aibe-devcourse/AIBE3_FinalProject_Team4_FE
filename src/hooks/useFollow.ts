import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useFollow(userId: number, initialIsFollowing: boolean) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    if (loading) return;

    const newState = !isFollowing;
    setIsFollowing(newState); // optimistic
    setLoading(true);

    try {
      await fetch(`${API_BASE_URL}/api/v1/follow/${userId}`, {
        method: newState ? 'POST' : 'DELETE',
        credentials: 'include',
      });
    } catch (e) {
      console.error(e);
      setIsFollowing(!newState); // rollback
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    loading,
    toggleFollow,
    setIsFollowing,
  };
}
