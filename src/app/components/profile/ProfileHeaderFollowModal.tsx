'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FollowListItem from './FollowListItem';

interface FollowModalProps {
  isOpen: boolean;
  onClose: (payload?: { followingCount: number; followersCount: number }) => void;
  tab: 'following' | 'followers';
  onTabChange: (t: 'following' | 'followers') => void;
  list: any[];
  loading: boolean;
  nickname: string;
  followingCount: number;
  followersCount: number;
  myId: number;
  profileUserId: number; // 프로필 주인 ID
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
  profileUserId,
}: FollowModalProps) {
  const isMyProfile = myId === profileUserId;
  const [localList, setLocalList] = useState<any[]>([]);
  const [localFollowingCount, setLocalFollowingCount] = useState(followingCount);
  const [localFollowersCount, setLocalFollowersCount] = useState(followersCount);

  // 모달이 열릴 때의 초기값 기억(닫을 때 변경 여부 판단용)
  const initialRef = useRef({ followingCount, followersCount });

  // 모달이 처음 열릴 때만 카운트 초기화
  useEffect(() => {
    if (isOpen) {
      setLocalFollowingCount(followingCount);
      setLocalFollowersCount(followersCount);
      initialRef.current = { followingCount, followersCount };
    }
  }, [isOpen]); // isOpen만 의존성으로 - 모달 열릴 때만 실행

  // 리스트는 탭 전환 시에도 업데이트
  useEffect(() => {
    if (isOpen) {
      setLocalList(list);
    }
  }, [isOpen, list]);

  const hasChanges = useMemo(() => {
    return (
      localFollowingCount !== initialRef.current.followingCount ||
      localFollowersCount !== initialRef.current.followersCount
    );
  }, [localFollowingCount, localFollowersCount]);

  const handleClose = () => {
    // 변경이 있었으면 부모에 최종 카운트 전달 → 프로필 페이지 즉시 반영 가능
    if (hasChanges) {
      onClose({ followingCount: localFollowingCount, followersCount: localFollowersCount });
      return;
    }
    onClose();
  };

  // 리스트 아이템에서 팔로우 변경을 올려받아 즉시 반영
  const handleToggleFollow = (targetUserId: number, nextIsFollowing: boolean) => {
    setLocalList((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, isFollowing: nextIsFollowing } : u)),
    );

    // 내 프로필일 때만 카운트 업데이트
    if (isMyProfile) {
      if (tab === 'following') {
        // 팔로잉 탭: 내가 팔로우하는 사람 언팔로우 → 내 followingCount 감소
        setLocalFollowingCount((c) => c + (nextIsFollowing ? 1 : -1));
      } else {
        // 팔로워 탭: 나를 팔로우하는 사람 맞팔 → 내 followingCount 증가
        setLocalFollowingCount((c) => c + (nextIsFollowing ? 1 : -1));
      }
    }
    // 다른 사람 프로필일 때는 카운트 변경 없음 (그 사람의 팔로잉/팔로워 수는 내 행동으로 바뀌지 않음)
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-[420px] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-center px-4 py-5 relative">
          <h2 className="text-xl font-bold">{nickname}</h2>
          <button
            className="absolute right-4 text-2xl text-slate-500 hover:text-slate-900"
            onClick={handleClose}
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
            팔로잉 {localFollowingCount}
          </button>

          <button
            onClick={() => onTabChange('followers')}
            className={`py-3 px-8 ${
              tab === 'followers' ? 'font-bold border-b-2 border-slate-900' : 'text-slate-500'
            }`}
          >
            팔로워 {localFollowersCount}
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
                <FollowListItem
                  key={user.id}
                  user={user}
                  myId={myId}
                  onToggleFollow={handleToggleFollow}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
