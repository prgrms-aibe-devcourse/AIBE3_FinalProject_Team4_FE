export async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || 'API 에러');
  return json;
}
