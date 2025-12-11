import Link from 'next/link';
import type { ShorlogItem } from './ShorlogFeedPageClient';
import { Heart, MessageCircle } from 'lucide-react';

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

      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('shorlog_modal_initial_path', currentPath);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      aria-label={`${item.nickname}의 숏로그: ${item.firstLine}`}
    >
      {/* 섬네일 영역 - 1:1 정사각형 */}
      <div className="relative w-full bg-slate-100">
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={item.thumbnailUrl || '/images/default-thumbnail.jpg'}
            alt={`${item.nickname}의 숏로그 썸네일 이미지`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>

      {/* 정보 영역 - 중앙 정렬 */}
      <div className="flex flex-col items-center text-center px-3 py-2.5 gap-1.5">
        {/* 프로필 & 닉네임 */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
            <img
              src={item.profileImgUrl || '/tmpProfile.png'}
              alt={`${item.nickname} 프로필`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <span className="text-xs font-semibold text-slate-900">
            {item.nickname}
          </span>
        </div>

        {/* 해시태그 */}
        {item.hashtags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {item.hashtags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 통계 */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
          <div className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            <span className="font-medium">{item.likeCount}</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="font-medium">{item.commentCount}</span>
          </div>
        </div>

        {/* 첫 문장 */}
        <div className="border-t border-slate-100 pt-2 w-full">
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-700">
            {item.firstLine}
          </p>
        </div>
      </div>
    </Link>
  );
}


