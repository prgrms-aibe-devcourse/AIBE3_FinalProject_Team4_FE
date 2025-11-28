// components/profile/FollowModal.tsx
'use client';

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: 'following' | 'followers';
  onTabChange: (t: 'following' | 'followers') => void;
  list: any[];
  loading: boolean;
  nickname: string;
  followingCount: number;
  followersCount: number;
}

export default function FollowModal({
  isOpen,
  onClose,
  tab,
  onTabChange,
  list,
  loading,
  nickname,
  followingCount,
  followersCount,
}: FollowModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px]">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-center px-4 py-5 relative flex-shrink-0">
          <h2 className="text-xl font-bold">{nickname}</h2>
          <button
            onClick={onClose}
            className="absolute right-4 text-2xl text-slate-500 hover:text-slate-900"
          >
            ✕
          </button>
        </div>

        {/* 탭 */}
        <div className="flex justify-center gap-8 border-b border-slate-200 text-sm flex-shrink-0">
          <button
            onClick={() => onTabChange('following')}
            className={`py-3 px-8 ${
              tab === 'following' ? 'font-bold border-b-2 border-slate-900' : 'text-slate-500'
            }`}
          >
            팔로잉 {followingCount}
          </button>

          <button
            onClick={() => onTabChange('followers')}
            className={`py-3 px-8 ${
              tab === 'followers' ? 'font-bold border-b-2 border-slate-900' : 'text-slate-500'
            }`}
          >
            팔로워 {followersCount}
          </button>
        </div>

        {/* 리스트 영역 */}
        <div className="px-10 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">불러오는 중…</div>
          ) : list.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">목록이 없습니다.</div>
          ) : (
            <ul className="space-y-4">
              {list.map((user: any) => (
                <li key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profileImgUrl || '/tmpProfile.png'}
                      alt={`${user.nickname} 프로필`}
                      className="w-12 h-12 rounded-full object-cover bg-slate-200"
                    />
                    <div>
                      <p className="font-semibold text-[15px]">{user.nickname}</p>
                    </div>
                  </div>

                  <button
                    className={`px-4 py-1.5 rounded-md text-xs ${
                      user.isFollowing
                        ? 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                        : 'bg-[#2979FF] hover:bg-[#1f62cc] text-white'
                    }`}
                  >
                    {user.isFollowing ? '팔로잉' : '팔로우'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
