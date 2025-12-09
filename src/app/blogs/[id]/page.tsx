import { fetchBlogDetailServer, fetchIsFollowingServer ,fetchMeServer} from '@/src/api/blogDetail.server';

import { BlogDetailClientWrapper } from '@/src/app/blogs/[id]/BlogDetailClientWrapper';
import type { BlogDetailDto } from '@/src/types/blog';


type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const blogId = Number(id);
  
  //  서버에서 바로 데이터 로드
  const [blogData, meData] = await Promise.all([
    fetchBlogDetailServer(blogId),
    fetchMeServer().catch(() => null), // 비로그인 -> null
  ]);

  if (!blogData) {
    // 404 페이지로 리다이렉트/ 간단한 메시지
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-10">
          <p className="p-8 text-sm text-slate-500">존재하지 않는 게시글입니다.</p>
        </div>
      </main>
    );
  }

  let initialIsFollowing = false;
  if (meData && blogData.userId !== meData.id) {
    try {
      // 이건 서버에서 호출해도 되고, client에서만 해도 됨 (선택)
      initialIsFollowing = await fetchIsFollowingServer(blogData.userId);
    } catch (err) {
      console.error('팔로우 여부 조회 실패', err);
    }
  }

  const isOwner = meData?.id === blogData.userId;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <BlogDetailClientWrapper
          initialData={blogData as BlogDetailDto}
          isOwner={isOwner}
          initialIsFollowing={initialIsFollowing}
        />
      </div>
    </main>
  );
}
