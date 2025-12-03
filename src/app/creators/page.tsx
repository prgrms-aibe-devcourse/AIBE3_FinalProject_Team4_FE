import type { Creator } from '@/src/app/components/creators/CreatorCard';
import CreatorGrid from '@/src/app/components/creators/CreatorGrid';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function CreatorsPage() {
  const creators = await fetchCreators();

  return (
    <main className="flex justify-center px-4 py-10">
      <div className="w-full max-w-[900px]">
        <header className="mb-6 md:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            POPULAR CREATORS
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            추천 계정
          </h1>
          <p className="mt-3 text-sm text-slate-500 md:text-base">
            지금 주목받는 크리에이터를 둘러보고, 마음에 드는 채널을 팔로우해보세요.
          </p>
        </header>

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
  const res = await fetch(`${API_BASE_URL}/api/v1/users/creators/v2`, {
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
