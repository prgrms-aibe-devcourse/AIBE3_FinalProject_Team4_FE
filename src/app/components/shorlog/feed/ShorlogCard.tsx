import Link from 'next/link';
import type { ShorlogItem } from './ShorlogFeedPageClient';

interface ShorlogCardProps {
  item: ShorlogItem;
}

export default function ShorlogCard({ item }: ShorlogCardProps) {
  return (
    <Link
      href={`/shorlog/${item.id}`}
      className="
        group flex h-full flex-col overflow-hidden
        rounded-2xl bg-white shadow-sm ring-1 ring-slate-100
        transition-transform duration-200
        hover:-translate-y-1 hover:shadow-lg
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-sky-500 focus-visible:ring-offset-2
        focus-visible:ring-offset-sky-50
      "
      aria-label={`${item.nickname}의 숏로그: ${item.firstLine}`}
    >
      {/* 상단 큰 썸네일 이미지 */}
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

      {/* 작성자 + 해시태그 + 좋아요/댓글 + 첫 문장 */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        {/* 아바타 + 닉네임 */}
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
            <img
              src={item.profileImgUrl}
              alt={`${item.nickname} 프로필 이미지`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {item.nickname}
          </p>

          {/* 해시태그 */}
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {item.hashtags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 좋아요 / 댓글 수 */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1.5">
            <LikeIcon />
            <span className="font-medium">{item.likeCount}</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <CommentIcon />
            <span className="font-medium">{item.commentCount}</span>
          </div>
        </div>

        {/* 첫 문장 프리뷰 */}
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-900">
            {item.firstLine}
          </p>
        </div>
      </div>
    </Link>
  );
}

function LikeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 text-slate-500"
      fill="currentColor"
    >
      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 text-slate-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h8a2 2 0 012 2v5.5a2 2 0 01-2 2h-3.382a1 1 0 00-.632.232L7.5 15.5V13H6a2 2 0 01-2-2V6z"
      />
    </svg>
  );
}
