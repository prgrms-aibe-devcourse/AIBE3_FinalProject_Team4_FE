'use client';

import { MainContentCard } from '@/src/types/main';
import { timeAgo } from '@/src/utils/timeAgo';
import { Bookmark, Heart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PopularContentsSection({ items }: { items: MainContentCard[] }) {
  const router = useRouter();

  const getDetailUrl = (item: MainContentCard) => {
    return item.type === 'SHORLOG' ? `/shorlog/${item.id}` : `/blogs/${item.id}`;
  };

  return (
    <section className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight">🔥 인기 콘텐츠</h2>
        <span className="text-xs text-slate-500">최근 일주일 기준</span>
      </div>

      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const src = item.thumbnailUrl ?? '/images/placeholder.png';

          return (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => router.push(getDetailUrl(item))}
              className="
                group cursor-pointer rounded-2xl overflow-hidden 
                bg-[#1A1F2E] text-white 
                shadow-md hover:shadow-2xl 
                transition-all duration-300 
                hover:-translate-y-1 hover:bg-[#212735]
              "
            >
              {/* 이미지 */}
              <div className="relative w-full h-52 overflow-hidden">
                <Image
                  src={src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw,
                         (max-width: 1200px) 50vw,
                         33vw"
                />
              </div>

              {/* 정보 영역 */}
              <div className="p-5 flex flex-col gap-2.5">
                <p className="text-xs text-blue-300 font-medium">{item.type}</p>

                <h3 className="text-lg font-semibold leading-tight line-clamp-2">{item.title}</h3>

                <p className="text-sm text-gray-400 line-clamp-2">{item.excerpt}</p>

                {/* 하단 메타 */}
                <div className="mt-3 flex justify-between items-center border-t border-gray-700 pt-3">
                  <span className="text-xs text-gray-500">{timeAgo(item.createdAt)}</span>

                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Heart size={15} className="opacity-80" /> {item.likeCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark size={15} className="opacity-80" /> {item.bookmarkCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
