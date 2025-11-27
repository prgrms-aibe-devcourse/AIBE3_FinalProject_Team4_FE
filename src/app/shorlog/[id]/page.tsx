import ShorlogDetailPageClient from '../../components/shorlog/detail/ShorlogDetailPageClient';
import ShorlogDetailModalWrapper from '../../components/shorlog/detail/ShorlogDetailModalWrapper';
import type { ShorlogDetail } from '../../components/shorlog/detail/types';
import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

// 실제 API 연동용
async function fetchShorlogDetail(id: string): Promise<ShorlogDetail> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/api/v1/shorlog/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch shorlog detail');
  }

  const data = await res.json();

  const detail: ShorlogDetail = {
    id: data.id,
    userId: data.userId,
    username: data.username,
    nickname: data.nickname,
    profileImgUrl: data.profileImgUrl ?? null,
    content: data.content,
    thumbnailUrls: data.thumbnailUrls ?? data.tahumbnailUrls ?? [],
    viewCount: data.viewCount ?? 0,
    likeCount: data.likeCount ?? 0,
    bookmarkCount: data.bookmarkCount ?? 0,
    commentCount: data.commentCount ?? 0,
    hashtags: data.hashtags ?? [],
    createdAt: data.createdAt,
    modifiedAt: data.modifiedAt,
    linkedBlogId: data.linkedBlogId ?? null,
  };

  return detail;
}

// 개발용 Mock
async function fetchMockShorlogDetail(id: string): Promise<ShorlogDetail> {
  return {
    id: Number(id),
    userId: 1,
    username: 'karpas762',
    nickname: '닉네임',
    profileImgUrl:
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=500',
    content:
      '새벽 3시에 갑자기 미친 듯이 뛰어다니는 고양이의 비밀에 대하여...\n\n' +
      '사실 아무 이유도 없을 수 있습니다. 하지만 그게 또 사랑스럽죠.\n\n' +
      '이 글은 고양이의 황당한 야간 질주를 기록한 숏로그입니다.',
    thumbnailUrls: [
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    viewCount: 123,
    likeCount: 24,
    bookmarkCount: 24,
    commentCount: 8,
    hashtags: ['#고양이', '#복슬복슬'],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    linkedBlogId: 42,
  };
}

export const metadata: Metadata = {
  title: '숏로그 상세 - TexTok',
};

export default async function ShorlogDetailPage({ params }: PageProps) {
  const { id } = params;

  // const detail = await fetchShorlogDetail(id);
  const detail = await fetchMockShorlogDetail(id);
  const isOwner = true; // TODO: 로그인 유저와 비교해서 계산

  return (
    <ShorlogDetailModalWrapper>
      <ShorlogDetailPageClient detail={detail} isOwner={isOwner} />
    </ShorlogDetailModalWrapper>
  );
}
