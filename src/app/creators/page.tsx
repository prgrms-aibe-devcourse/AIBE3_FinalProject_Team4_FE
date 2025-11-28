import type { Creator } from '@/src/app/components/creators/CreatorCard';
import CreatorGrid from '@/src/app/components/creators/CreatorGrid';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function CreatorsPage() {
  const creators = await fetchCreators();

  return (
    <main className="flex justify-center px-4 py-10">
      <div className="w-full max-w-[900px]">
        <h1 className="text-2xl font-bold mb-6">인기 크리에이터</h1>
        <CreatorGrid creators={creators} />
      </div>
    </main>
  );
}

async function fetchCreators() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  const res = await fetch(`${API_BASE_URL}/api/v1/users/creators`, {
    method: 'GET',
    headers: {
      cookie: cookieHeader,
    },
  });
  if (res.ok) {
    const data = await res.json();
    return data.data as Creator[];
  }

  console.error('Failed to fetch creators:', res.statusText);

  return []; // 임시로 빈 배열 반환
}
