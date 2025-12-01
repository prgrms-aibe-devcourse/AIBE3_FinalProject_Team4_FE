import ShorlogEditModal from '@/src/app/components/shorlog/edit/ShorlogEditModal';
import type { ShorlogDetail } from '@/src/app/components/shorlog/detail/types';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 수정할 숏로그 데이터 조회
async function fetchShorlogDetail(id: string): Promise<ShorlogDetail> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  const res = await fetch(`${API_BASE_URL}/api/v1/shorlog/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('숏로그를 찾을 수 없습니다.');
    }
    throw new Error('숏로그를 불러오는데 실패했습니다.');
  }

  const rsData = await res.json();
  const data = rsData.data;

  return {
    id: data.id,
    userId: data.userId,
    username: data.username,
    nickname: data.nickname,
    profileImgUrl: data.profileImgUrl ?? null,
    content: data.content,
    thumbnailUrls: data.thumbnailUrls ?? [],
    viewCount: data.viewCount ?? 0,
    likeCount: data.likeCount ?? 0,
    bookmarkCount: data.bookmarkCount ?? 0,
    commentCount: data.commentCount ?? 0,
    hashtags: data.hashtags ?? [],
    createdAt: data.createdAt,
    modifiedAt: data.modifiedAt,
    linkedBlogId: data.linkedBlogId ?? null,
  };
}

export const metadata: Metadata = {
  title: '숏로그 수정 - TexTok',
};

export default async function ShorlogEditPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await fetchShorlogDetail(id);

  return <ShorlogEditModal shorlogId={id} initialData={detail} />;
}

