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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => {
        const src = item.thumbnailUrl ?? '/images/placeholder.png';

        return (
          <div
            key={`${item.type}-${item.id}`}
            onClick={() => router.push(getDetailUrl(item))}
            className="cursor-pointer rounded-2xl overflow-hidden bg-[#121826] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative w-full h-48">
              <Image
                src={src}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw,
                       (max-width: 1200px) 50vw,
                       33vw"
              />
            </div>

            <div className="p-4 flex flex-col gap-2">
              <p className="text-sm text-gray-400">{item.type}</p>

              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.excerpt}</p>

              <div className="flex justify-between items-center mt-3 border-t border-gray-700 pt-3">
                <span className="text-xs text-gray-400">{timeAgo(item.createdAt)}</span>

                <span className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Heart size={16} /> {item.likeCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark size={16} /> {item.bookmarkCount}
                  </div>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
