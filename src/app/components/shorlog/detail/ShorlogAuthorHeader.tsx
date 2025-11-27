'use client';

import { useEffect, useRef, useState } from 'react';
import { requireAuth } from '../../../../lib/auth';

interface Props {
  username: string;
  nickname: string;
  profileImgUrl: string | null;
  isOwner?: boolean;
}

export default function ShorlogAuthorHeader({
  username,
  nickname,
  profileImgUrl,
  isOwner = false,
}: Props) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleFollow = () => {
    if (!requireAuth('팔로우')) return;
    // TODO: 1번(주권영) 팔로우 컴포넌트 연동
    setIsFollowing((prev) => !prev);
  };

  const handleMenuAction = (action: string) => {
    setMenuOpen(false);
    // TODO: 수정/삭제/블로그 연결 기능 구현
    alert(`${action} 기능은 추후 제공될 예정입니다.`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200 md:h-10 md:w-10">
          <img
            src={profileImgUrl ?? 'https://api.dicebear.com/7.x/identicon/svg?seed=shorlog-user'}
            alt={`${username} 프로필 이미지`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-slate-900">@{username}</span>
          <span className="text-[13px] text-slate-500">{nickname}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {!isOwner && (
          <button
            type="button"
            onClick={toggleFollow}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isFollowing
                ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 focus-visible:ring-slate-300'
                : 'bg-[#2979FF] text-white hover:bg-[#1863db] focus-visible:ring-[#2979FF]'
            }`}
          >
            {isFollowing ? '팔로잉' : '팔로우'}
          </button>
        )}

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="숏로그 더보기 메뉴"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              ⋯
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-slate-100 bg-white py-1 text-xs text-slate-700 shadow-lg" role="menu">
                <button type="button" onClick={() => handleMenuAction('블로그 연결')} className="flex w-full items-center justify-between px-3 py-1.5 hover:bg-slate-50">
                  블로그 연결하기
                </button>
                <button type="button" onClick={() => handleMenuAction('수정')} className="flex w-full items-center justify-between px-3 py-1.5 hover:bg-slate-50">
                  수정
                </button>
                <button type="button" onClick={() => handleMenuAction('삭제')} className="flex w-full items-center justify-between px-3 py-1.5 text-rose-600 hover:bg-rose-50">
                  삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
