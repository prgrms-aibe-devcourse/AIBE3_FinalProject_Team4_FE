import Link from 'next/link';
import type { ShorlogItem } from './ShorlogFeedPageClient';
import { Bookmark, Heart, MessageCircle } from 'lucide-react';

interface ShorlogCardProps {
  item: ShorlogItem;
  index: number;
  allItems: ShorlogItem[];
}

export default function ShorlogCard({ item, index, allItems }: ShorlogCardProps) {
  const prevItem = index > 0 ? allItems[index - 1] : null;
  const nextItem = index < allItems.length - 1 ? allItems[index + 1] : null;

  const queryParams = new URLSearchParams();
  if (prevItem) queryParams.set('prev', prevItem.id.toString());
  if (nextItem) queryParams.set('next', nextItem.id.toString());

  const href = `/shorlog/${item.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      const feedIds = allItems.map(item => item.id);
      sessionStorage.setItem('shorlog_feed_ids', JSON.stringify(feedIds));
      sessionStorage.setItem('shorlog_current_index', index.toString());
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50"
      aria-label={`${item.nickname}의 숏로그: ${item.firstLine}`}
    >
      <div className="relative w-full bg-slate-100">
        <div className="aspect-[3/4] w-full overflow-hidden">
          <img
            src={item.thumbnailUrl || '/images/default-thumbnail.jpg'}
            alt={`${item.nickname}의 숏로그 썸네일 이미지`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
            <img
              src={item.profileImgUrl}
              alt={`${item.nickname} 프로필 이미지`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{item.nickname}</p>

          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {item.hashtags.slice(0, 3).map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            <span className="font-medium">{item.likeCount}</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">{item.commentCount}</span>
          </div>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-900">{item.firstLine}</p>
        </div>
      </div>
    </Link>
  );
}


