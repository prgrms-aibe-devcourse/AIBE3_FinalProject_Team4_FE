import type { BlogSummary } from '@/src/types/blog';
import { formatRelativeTime } from '@/src/utils/time';
import dayjs from 'dayjs';
import { Bookmark, Eye, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

type BlogCardProps = {
  blog: BlogSummary;
};

export function BlogCard({ blog }: BlogCardProps) {
  const hasThumbnail = !!blog.thumbnailUrl;
  const hasProfile = !!blog.profileImageUrl;
  const liked = blog.likedByMe;
  const bookmarked = blog.bookmarkedByMe;
  return (
    <Link href={`/blogs/${blog.id}`} className="block group">
      <article className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start gap-4">
          {/* 썸네일 */}
          <div className="hidden flex-shrink-0 sm:block">
            {hasThumbnail ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={blog.thumbnailUrl!}
                  alt={`${blog.title} 썸네일`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-[10px] text-slate-400">
                썸네일 없음
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AuthorAvatar name={blog.userNickname} url={blog.profileImageUrl ?? undefined} />
              <span className="font-medium text-slate-800">{blog.userNickname}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden />
              <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden />
              <span
                className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500"
                title={dayjs(blog.createdAt).format('YYYY.MM.DD HH:mm')}
              >
                {formatRelativeTime(blog.createdAt)}
              </span>
            </div>

            {/* 제목 + 요약 */}
            <div className="space-y-1.5">
              <h2 className="line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base">
                {blog.title}
              </h2>
              <p className="line-clamp-2 text-xs text-slate-500 sm:text-sm">{blog.contentPre}</p>
            </div>

            {/* 태그 + 통계 */}
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-wrap gap-1">
                {blog.hashtagNames.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <Stat
                  icon={<Eye size={14} className="text-slate-400" />}
                  label="조회"
                  value={blog.viewCount}
                />
                <Stat
                  icon={<MessageCircle size={14} className="text-slate-400" />}
                  label="댓글"
                  value={blog.commentCount}
                />
                <Stat
                  icon={
                    <Heart
                      size={14}
                      className={liked ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}
                    />
                  }
                  label="좋아요"
                  value={blog.likeCount}
                />
                <Stat
                  icon={
                    <Bookmark
                      size={14}
                      className={bookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}
                    />
                  }
                  label="저장"
                  value={blog.bookmarkCount}
                />
                {/* {blog && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-[#2979FF]/5 px-2 py-0.5 text-[11px] font-semibold text-[#2979FF]"
                    aria-label="맞춤 추천 글"
                  >
                  </span>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

type AuthorAvatarProps = {
  name: string;
  url?: string;
};

function AuthorAvatar({ name, url }: AuthorAvatarProps) {
  const initial = name.charAt(0);
  if (!url) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
        {initial}
      </div>
    );
  }

  return (
    <div className="relative h-7 w-7 overflow-hidden rounded-full bg-slate-200">
      <Image src={url} alt={`${name} 프로필 이미지`} fill sizes="28px" className="object-cover" />
    </div>
  );
}

type StatProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

export function Stat({ icon, label, value }: StatProps) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
      {icon}
      <span className="leading-none">{value}</span>
    </div>
  );
}
