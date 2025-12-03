'use client';

import { BlogSummary } from '@/src/types/blog';
import { Bookmark, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface BlogSearchCardProps {
  item: BlogSummary;
  searchKeyword?: string;
}

export default function BlogSearchCard({ item, searchKeyword }: BlogSearchCardProps) {
  const href = `/blogs/${item.id}`;

  // 검색어 하이라이트
  const highlightSearchKeyword = (text: string, keyword?: string): ReactNode => {
    if (!keyword || !text) return text;

    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  };

  // 내용 미리보기
  const rawContent = item.contentPre ?? '';

  const contentPreview =
    rawContent && rawContent.length > 80
      ? `${rawContent.slice(0, 80)}…`
      : rawContent || '내용이 없습니다.';

  const hasThumbnail = !!item.thumbnailUrl;
  const hasProfile = !!item.profileImageUrl;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50"
      aria-label={`${item.userNickname}의 블로그 글: ${item.title}`}
    >
      {/* 썸네일 영역 – 쇼로그 카드와 비슷한 비율 */}
      <div className="relative w-full bg-slate-100">
        <div className="aspect-[3/4] w-full overflow-hidden">
          {hasThumbnail ? (
            <img
              src={item.thumbnailUrl!}
              alt={`${item.title} 썸네일 이미지`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[11px] text-slate-400">
              썸네일 없음
            </div>
          )}
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        {/* 작성자 + 프로필 */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 overflow-hidden rounded-full bg-slate-200">
            {hasProfile ? (
              <img
                src={item.profileImageUrl!}
                alt={`${item.userNickname} 프로필 이미지`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-700">
                {item.userNickname.charAt(0)}
              </div>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-900">{item.userNickname}</p>
        </div>

        {/* 제목 + 내용 요약 */}
        <div className="mt-3 space-y-1.5">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
            {highlightSearchKeyword(item.title, searchKeyword)}
          </h3>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-500">
            {highlightSearchKeyword(contentPreview, searchKeyword)}
          </p>
        </div>

        {/* 태그 + 통계 */}
        <div className="mt-3 flex flex-1 flex-col justify-end gap-3">
          <div className="flex flex-wrap gap-1">
            {item.hashtagNames.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="inline-flex items-center gap-2">
              <Stat
                icon={<Heart className="h-3.5 w-3.5" />}
                value={item.likeCount}
                label="좋아요"
              />
              <Stat
                icon={<MessageCircle className="h-3.5 w-3.5" />}
                value={item.commentCount}
                label="댓글"
              />
              <Stat
                icon={<Bookmark className="h-3.5 w-3.5" />}
                value={item.bookmarkCount}
                label="저장"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

type StatProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

function Stat({ icon, label, value }: StatProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {icon}
      <span className="font-medium">{value}</span>
    </div>
  );
}
