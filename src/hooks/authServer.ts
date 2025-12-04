export async function getCurrentUserServer() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/v1/auth/me`,
      {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
    );

    if (!res.ok) return null;

    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}
