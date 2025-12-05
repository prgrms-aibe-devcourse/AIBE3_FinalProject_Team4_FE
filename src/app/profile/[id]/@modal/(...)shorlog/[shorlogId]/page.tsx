'use client';

import ShorlogDetailPageClient from '@/src/app/components/shorlog/detail/ShorlogDetailPageClient';
import ProfileShorlogModalWrapper from '@/src/app/components/profile/ProfileShorlogModalWrapper';
import type { ShorlogDetail } from '@/src/app/components/shorlog/detail/types';
import { fetchMe } from '@/src/api/user';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/src/app/components/common/LoadingSpinner';

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

export default function ProfileShorlogModalPage() {
  const params = useParams();
  const shorlogId = String(params.shorlogId);

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
      <ProfileShorlogModalWrapper>
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner label="숏로그를 불러오는 중입니다" />
        </div>
      </ProfileShorlogModalWrapper>
    );
  }

  if (loadError) {
    return (
      <ProfileShorlogModalWrapper>
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-red-500">숏로그를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </ProfileShorlogModalWrapper>
    );
  }

  if (!detail) {
    return (
      <ProfileShorlogModalWrapper>
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-slate-500">존재하지 않는 숏로그입니다.</p>
        </div>
      </ProfileShorlogModalWrapper>
    );
  }

  const isOwner = me?.id === detail.userId;

  return (
    <ProfileShorlogModalWrapper>
      <ShorlogDetailPageClient detail={detail} isOwner={isOwner} />
    </ProfileShorlogModalWrapper>
  );
}
