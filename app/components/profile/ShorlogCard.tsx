// app/components/profile/ShorlogCard.tsx
import { ShorlogPost } from '@/app/profile/page';
import Link from 'next/link';

export const ShorlogCard = ({ post }: { post: ShorlogPost }) => {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:-translate-y-1 hover:shadow-md transition"
    >
      <div className="relative w-full bg-slate-100 overflow-hidden">
        <img
          src={post.thumbnailUrl}
          alt={`${post.title} 썸네일`}
          className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2 pt-10 text-white text-[11px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">♡ {post.likes}</span>
            <span className="flex items-center gap-1">💬 {post.comments}</span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2">
        <p className="line-clamp-2 text-[13px] leading-snug text-slate-800">{post.excerpt}</p>
        <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
          {post.type === 'short' ? '숏로그' : '블로그'}
        </span>
      </div>
    </Link>
  );
};
