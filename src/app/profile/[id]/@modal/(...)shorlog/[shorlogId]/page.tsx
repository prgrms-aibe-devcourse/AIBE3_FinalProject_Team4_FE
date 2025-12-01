import ShorlogDetailPageClient from '@/src/app/components/shorlog/detail/ShorlogDetailPageClient';
import ProfileShorlogModalWrapper from '@/src/app/components/profile/ProfileShorlogModalWrapper';
import type { ShorlogDetail } from '@/src/app/components/shorlog/detail/types';
import { getSessionUser } from '@/src/lib/getSessionUser';

interface PageProps {
  params: Promise<{
    shorlogId: string; // 숏로그 ID
  }>;
  searchParams: Promise<{
    profileId?: string;
    prev?: string;
    next?: string;
  }>;
}

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

export default async function ProfileShorlogModalPage({ params }: PageProps) {
  const { shorlogId } = await params;

  // 병렬로 데이터 가져오기
  const [detail, currentUser] = await Promise.all([
    fetchShorlogDetail(shorlogId),
    getSessionUser()
  ]);

  // 로그인한 유저와 숏로그 작성자 비교
  const isOwner = currentUser ? currentUser.id === detail.userId : false;

  return (
    <ProfileShorlogModalWrapper>
      <ShorlogDetailPageClient detail={detail} isOwner={isOwner} />
    </ProfileShorlogModalWrapper>
  );
}
