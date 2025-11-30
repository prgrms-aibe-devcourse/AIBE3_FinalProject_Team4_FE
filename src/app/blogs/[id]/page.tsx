'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchBlogDetail, deleteBlog, toggleBookmark, toggleLike } from '@/src/api/blogDetail';

import type { BlogDetailDto } from '@/src/types/blog';
import { BlogDetailHeader } from '@/src/app/components/blogs/detail/BlogDetailHeader';
import { BlogReactionBar } from '@/src/app/components/blogs/detail/BlogReactionBar';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = Number(params.id);

  const [blog, setBlog] = useState<BlogDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBlogDetail(blogId);
        setBlog(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [blogId]);

  // ===== 핸들러들 =====

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteBlog(blogId);
    router.replace('/blogs');
  };

  const handleEdit = () => {
    router.push(`/blogs/${blogId}/edit`);
  };

  const handleToggleLike = async () => {
    await toggleLike(blogId);
    setBlog((prev) =>
      prev
        ? {
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
          }
        : prev,
    );
  };

  const handleToggleBookmark = async () => {
    await toggleBookmark(blogId);
    setBlog((prev) =>
      prev
        ? {
            ...prev,
            isBookmarked: !prev.isBookmarked,
            bookmarkCount: prev.isBookmarked ? prev.bookmarkCount - 1 : prev.bookmarkCount + 1,
          }
        : prev,
    );
  };

  if (loading) return <p className="p-8">로딩 중...</p>;
  if (!blog) return <p className="p-8">존재하지 않는 게시글입니다.</p>;

  const isOwner = true; // 로그인 유저 ID랑 blog.username 비교해서 실제로 판단

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <article className="rounded-3xl bg-white/90 shadow-xl ring-1 ring-slate-100 backdrop-blur-sm">
          {/* 상단 헤더 */}
          <BlogDetailHeader
            blog={blog}
            isOwner={isOwner}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onConnectShorlog={() => alert('숏로그 연결 예정')}
            onShare={() => {
              navigator.clipboard.writeText(location.href);
              alert('링크가 복사되었습니다');
            }}
          />

          {/* 본문 */}
          <section className="px-5 py-8 sm:px-8">
            <div className="prose prose-slate max-w-none leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
               {blog.content}
              </ReactMarkdown>
            </div>

            {/* 태그 */}
            {blog.hashtagNames.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {blog.hashtagNames.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* 리액션 바 */}
          <BlogReactionBar
            blog={blog}
            onToggleLike={handleToggleLike}
            onToggleBookmark={handleToggleBookmark}
            onOpenLinkedShorlogs={() => alert('연결 숏로그 보기 예정')}
            onShare={() => {
              navigator.clipboard.writeText(location.href);
              alert('공유 링크 복사됨');
            }}
          />
        </article>
      </div>
    </main>
  );
}
