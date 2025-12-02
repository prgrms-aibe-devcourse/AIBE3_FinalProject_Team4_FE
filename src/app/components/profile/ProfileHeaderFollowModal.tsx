'use client';

import { useEffect, useState } from 'react';
import FollowListItem from './FollowListItem';

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
  myId: number;
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
  myId,
}: FollowModalProps) {
  const [localList, setLocalList] = useState(list);

  useEffect(() => {
    setLocalList(list);
  }, [list]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose} // 오버레이 클릭 시 닫기
    >
      <div
        className="bg-white w-full max-w-[420px] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px]"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫기 방지
      >
        {/* 헤더 */}
        <div className="flex items-center justify-center px-4 py-5 relative">
          <h2 className="text-xl font-bold">{nickname}</h2>
          <button
            className="absolute right-4 text-2xl text-slate-500 hover:text-slate-900"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 탭 */}
        <div className="flex justify-center gap-8 border-b border-slate-200">
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

        {/* 리스트 */}
        <div className="px-10 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">불러오는 중…</div>
          ) : localList.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">목록이 없습니다.</div>
          ) : (
            <ul className="space-y-4">
              {localList.map((user) => (
                <FollowListItem key={user.id} user={user} myId={myId} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
