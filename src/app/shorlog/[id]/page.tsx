'use client';

import ShorlogDetailPageClient from '../../components/shorlog/detail/ShorlogDetailPageClient';
import ShorlogDetailModalWrapper from '../../components/shorlog/detail/ShorlogDetailModalWrapper';
import type { ShorlogDetail } from '../../components/shorlog/detail/types';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '@/src/api/user';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

export default function ShorlogDetailPage() {
  const params = useParams();
  const shorlogId = String(params.id);
  const { data: detail, isLoading, error } = useQuery({
    queryKey: ['shorlog-detail', shorlogId],
    queryFn: () => fetchShorlogDetail(shorlogId),
    staleTime: 0, // 항상 최신 데이터 확인
  });

  const { data: me } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => fetchMe().catch(() => null),
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  });

  return (
    <ShorlogDetailModalWrapper>
      {isLoading && !detail ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner label="숏로그를 불러오는 중입니다" />
        </div>
      ) : error ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-slate-600">숏로그를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      ) : !detail ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-slate-600">존재하지 않는 숏로그입니다.</p>
        </div>
      ) : (
        <ShorlogDetailPageClient detail={detail} isOwner={me?.id === detail.userId} />
      )}
    </ShorlogDetailModalWrapper>
  );
}
