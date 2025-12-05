const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getNotifications() {
  const res = await fetch(`${BASE}/api/v1/notifications`, {
    credentials: 'include',
  });
  const data = await res.json();
  return data.data;
}

export async function getUnreadNotificationCount() {
  const res = await fetch(`${BASE}/api/v1/notifications/unread-count`, {
    credentials: 'include',
  });
  const data = await res.json();
  return data.data;
}

export async function markAllAsRead() {
  const res = await fetch(`${BASE}/api/v1/notifications/read-all`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.json();
}

export async function getRecentNotifications() {
  const res = await fetch(`${BASE}/api/v1/notifications/recent`, { credentials: 'include' });
  const data = await res.json();
  return data.data;
}

export async function deleteNotification(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/notifications/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('알림 삭제 실패');
  }
}

export async function deleteAllNotifications(): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/notifications`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('전체 알림 삭제 실패');
  }
}
