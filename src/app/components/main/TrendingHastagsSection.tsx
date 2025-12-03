'use client';

import { useRouter } from 'next/navigation';

export default function TrendingHashtagsSection({ tags }: { tags: string[] }) {
  const router = useRouter();

  const goToTagSearch = (tag: string) => {
    const encoded = encodeURIComponent(`#${tag}`);
    router.push(`/search/shorlog?keyword=${encoded}&sort=latest`);
  };

  return (
    <div className="bg-[#121826] rounded-2xl p-6 text-white shadow-lg">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">🔷 트렌딩 해시태그</h3>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <span
            key={tag}
            onClick={() => goToTagSearch(tag)}
            className="cursor-pointer px-3 py-1 bg-[#1a2030] rounded-full text-sm text-gray-300 hover:bg-[#243043] hover:text-white transition"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
