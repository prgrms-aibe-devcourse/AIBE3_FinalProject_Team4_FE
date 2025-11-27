import ShorlogDetailPageClient from '../../components/shorlog/detail/ShorlogDetailPageClient';
import ShorlogDetailModalWrapper from '../../components/shorlog/detail/ShorlogDetailModalWrapper';
import type { ShorlogDetail } from '../../components/shorlog/detail/types';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 실제 API 연동용
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
  title: '숏로그 상세 - TexTok',
};

export default async function ShorlogDetailPage({ params }: PageProps) {
  const { id } = await params;

  const detail = await fetchShorlogDetail(id);
  // TODO: 로그인한 유저 ID와 detail.userId 비교하여 isOwner 계산
  const isOwner = false;

  return (
    <ShorlogDetailModalWrapper>
      <ShorlogDetailPageClient detail={detail} isOwner={isOwner} />
    </ShorlogDetailModalWrapper>
  );
}
