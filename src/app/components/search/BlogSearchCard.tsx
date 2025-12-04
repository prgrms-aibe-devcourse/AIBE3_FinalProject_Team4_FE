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

  const highlightSearchKeyword = (text: string, keyword?: string): ReactNode => {
    if (!text) return text;

    const trimmed = (keyword ?? '').trim();
    if (!trimmed) return text;

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <mark key={index} className="rounded-[3px] bg-yellow-100 px-0.5 text-yellow-900">
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
      className="group flex w-full items-stretch gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50"
      aria-label={`${item.userNickname}의 블로그 글: ${item.title}`}
    >
      {/* 왼쪽 썸네일 (리스트용: 가로형 비율) */}
      <div className="relative hidden h-24 w-32 overflow-hidden rounded-lg bg-slate-100 sm:block">
        {hasThumbnail ? (
          <img
            src={item.thumbnailUrl!}
            alt={`${item.title} 썸네일 이미지`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
            썸네일 없음
          </div>
        )}
      </div>

      {/* 오른쪽 내용 영역 */}
      <div className="flex min-w-0 flex-1 flex-col">
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
          <p className="truncate text-xs font-semibold text-slate-900">{item.userNickname}</p>
        </div>

        {/* 제목 + 내용 요약 */}
        <div className="mt-1.5 space-y-1">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
            {highlightSearchKeyword(item.title, searchKeyword)}
          </h3>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-500">
            {highlightSearchKeyword(contentPreview, searchKeyword)}
          </p>
        </div>

        {/* 태그 + 통계 */}
        <div className="mt-2 flex items-end justify-between gap-3">
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

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Stat icon={<Heart className="h-3.5 w-3.5" />} value={item.likeCount} label="좋아요" />
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
