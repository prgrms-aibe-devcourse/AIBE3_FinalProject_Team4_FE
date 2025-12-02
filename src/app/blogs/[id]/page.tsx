'use client';

import { deleteBlog, fetchBlogDetail } from '@/src/api/blogDetail';
import { fetchIsFollowing } from '@/src/api/follow';
import { fetchMe } from '@/src/api/user';
import type { BlogDetailDto } from '@/src/types/blog';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BlogDetailClient from './BlogDetailClient';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = Number(params.id);

  const [blog, setBlog] = useState<BlogDetailDto | null>(null);
  const [me, setMe] = useState<{ id: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [initialIsFollowing, setInitialIsFollowing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [blogData, meData] = await Promise.all([
          fetchBlogDetail(blogId),
          fetchMe().catch(() => null), // 비로그인 → null
        ]);
        let following = false;
        if (meData && blogData.userId !== meData.id) {
          try {
            following = await fetchIsFollowing(blogData.userId);
          } catch (err) {
            console.error('팔로우 여부 조회 실패', err);
          }
        }
        if (!cancelled) {
          setBlog(blogData);
          setMe(meData);
          setInitialIsFollowing(following);
        }
      } catch (e: any) {
        console.error('블로그 단건 조회 실패', e);
        if (!cancelled) {
          setLoadError(e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [blogId]);
  //TODO: 로딩스피너 도입
  if (loading) return <p className="p-8">로딩 중...</p>;
  if (!blog) return <p className="p-8">존재하지 않는 게시글입니다.</p>;

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteBlog(blogId);
      router.replace('/blogs');
    } catch (e) {
      console.error('삭제 실패', e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = () => {
    router.push(`/blogs/${blogId}/edit`);
  };

  if (loading) return <p className="p-8">로딩 중...</p>;

  if (loadError) {
    return <p className="p-8">게시글을 불러오는 중 오류가 발생했습니다.</p>;
  }

  if (!blog) return <p className="p-8">존재하지 않는 게시글입니다.</p>;

  const isOwner = me?.id === blog.userId;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <BlogDetailClient
          initialData={blog}
          isOwner={isOwner}
          initialIsFollowing={initialIsFollowing}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </main>
  );
}
