'use client';

import { useEffect, useState } from 'react';
import ProfileEditModal from './ProfileHeaderEditModal';
import FollowModal from './ProfileHeaderFollowModal';

interface ProfileHeaderProps {
  profile: {
    id: number;
    nickname: string;
    profileImgUrl: string;
    bio: string;
    followersCount: number;
    followingCount: number;
    likesCount: number;
    shorlogsCount: number;
    blogsCount: number;
  };
  isMyPage: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ProfileHeader = ({ profile, isMyPage }: ProfileHeaderProps) => {
  /** 팔로잉/팔로워 모달 */
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [tab, setTab] = useState<'following' | 'followers'>('following');
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!followModalOpen) return;

    async function load() {
      setLoading(true);

      const endpoint =
        tab === 'followers'
          ? `/api/v1/follow/followers/${profile.id}`
          : `/api/v1/follow/followings/${profile.id}`;

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
      });

      const json = await res.json();
      setList(json.data ?? []);
      setLoading(false);
    }

    load();
  }, [followModalOpen, tab, profile.id]);

  /** 프로필 편집 모달 */
  const [editOpen, setEditOpen] = useState(false);

  /** 숫자 압축 */
  const formatCompactNumber = (value: number | null) => {
    const num = Number(value ?? 0);
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <>
      <section className="flex flex-col sm:flex-row gap-6">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <div className="w-[200px] h-[200px] rounded-full overflow-hidden shadow-md bg-slate-100">
            <img
              src={profile.profileImgUrl || '/tmpProfile.png'}
              alt={`${profile.nickname} 프로필 이미지`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 우측 프로필 정보 */}
        <div className="flex flex-col justify-center gap-3 flex-1">
          {/* 닉네임 */}
          <h1 className="text-2xl sm:text-2.5xl font-bold">{profile.nickname}</h1>

          {/* 버튼 묶음 */}
          <div className="flex items-center gap-2 flex-wrap">
            {isMyPage ? (
              <>
                <button
                  onClick={() => setEditOpen(true)}
                  className="rounded-md bg-[#2979FF] px-5 py-2 text-sm font-medium text-white hover:bg-[#1f62cc]"
                >
                  프로필 편집
                </button>

                <button
                  aria-label="더보기"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 hover:bg-slate-200"
                >
                  ⋯
                </button>
              </>
            ) : (
              <>
                <button className="rounded-md bg-[#2979FF] px-8 py-2 text-sm font-medium text-white hover:bg-[#1f62cc]">
                  팔로우
                </button>

                <button className="rounded-md border border-slate-300 px-8 py-2 text-sm font-medium hover:bg-slate-200">
                  메시지
                </button>

                <button
                  aria-label="더보기"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 hover:bg-slate-200"
                >
                  ⋯
                </button>
              </>
            )}
          </div>

          {/* 팔로잉/팔로워/좋아요 */}
          <div className="flex flex-wrap gap-6 text-[15px] text-slate-700 font-medium">
            {/* 팔로잉 */}
            <button
              onClick={() => {
                setTab('following');
                setFollowModalOpen(true);
              }}
              className="hover:underline hover:text-slate-900"
            >
              <span className="font-extrabold">{profile.followingCount}</span> 팔로잉
            </button>

            {/* 팔로워 */}
            <button
              onClick={() => {
                setTab('followers');
                setFollowModalOpen(true);
              }}
              className="hover:underline hover:text-slate-900"
            >
              <span className="font-extrabold">{formatCompactNumber(profile.followersCount)}</span>{' '}
              팔로워
            </button>

            {/* 좋아요 */}
            <span>
              <span className="font-extrabold">{formatCompactNumber(profile.likesCount)}</span>{' '}
              좋아요
            </span>
          </div>

          {/* 자기소개 */}
          <p className="text-m text-slate-600 whitespace-pre-line">{profile.bio}</p>
        </div>
      </section>

      {/* --------------------------- */}
      {/*  프로필 편집 모달 */}
      {/* --------------------------- */}
      <ProfileEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        profile={{
          id: profile.id,
          nickname: profile.nickname,
          bio: profile.bio,
          profileImgUrl: profile.profileImgUrl,
        }}
      />

      {/* --------------------------- */}
      {/*  팔로잉/팔로워 모달 */}
      {/* --------------------------- */}
      <FollowModal
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        tab={tab}
        onTabChange={setTab}
        list={list}
        loading={loading}
        nickname={profile.nickname}
        followingCount={profile.followingCount}
        followersCount={profile.followersCount}
      />
    </>
  );
};
