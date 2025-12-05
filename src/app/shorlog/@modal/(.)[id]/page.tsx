'use client';

import ShorlogDetailPageClient from '../../../components/shorlog/detail/ShorlogDetailPageClient';
import ShorlogDetailModalWrapper from '../../../components/shorlog/detail/ShorlogDetailModalWrapper';
import type { ShorlogDetail } from '../../../components/shorlog/detail/types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchMe } from '@/src/api/user';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

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

export default function ShorlogModalPage() {
  const params = useParams();
  const shorlogId = String(params.id);

  const [detail, setDetail] = useState<ShorlogDetail | null>(null);
  const [me, setMe] = useState<{ id: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [shorlogData, meData] = await Promise.all([
          fetchShorlogDetail(shorlogId),
          fetchMe().catch(() => null), // 비로그인 → null
        ]);

        if (!cancelled) {
          setDetail(shorlogData);
          setMe(meData);
        }
      } catch (e: any) {
        console.error('숏로그 조회 실패', e);
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
  }, [shorlogId]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner label="숏로그를 불러오는 중입니다" />
      </div>
    );
  }

  if (loadError) {
    return <p className="p-8">숏로그를 불러오는 중 오류가 발생했습니다.</p>;
  }

  if (!detail) {
    return <p className="p-8">존재하지 않는 숏로그입니다.</p>;
  }

  const isOwner = me?.id === detail.userId;

  return (
    <ShorlogDetailModalWrapper>
      <ShorlogDetailPageClient detail={detail} isOwner={isOwner} />
    </ShorlogDetailModalWrapper>
  );
}



