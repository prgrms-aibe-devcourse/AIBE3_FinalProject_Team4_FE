// app/components/profile/ProfileHeader.tsx

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
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const formatCompactNumber = (value: number | null) => {
    const num = Number(value ?? 0);
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <section className="flex flex-col sm:flex-row sm:items-center gap-6">
      <div className="flex-shrink-0">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
          <img
            src={profile.profileImgUrl}
            alt={`${profile.nickname} 프로필 이미지`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{profile.nickname}</h1>
            </div>

            <p className="mt-2 text-sm text-slate-600">{profile.bio}</p>

            <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-slate-600">
              <span>
                <span className="font-semibold">{profile.followingCount}</span> 팔로잉
              </span>
              <span>
                <span className="font-semibold">{formatCompactNumber(profile.followersCount)}</span>{' '}
                팔로워
              </span>
              <span>
                <span className="font-semibold">{formatCompactNumber(profile.likesCount)}</span>{' '}
                좋아요
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center rounded-full bg-[#2979FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f62cc]">
              프로필 편집
            </button>

            <button
              aria-label="더보기"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50"
            >
              ⋯
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
