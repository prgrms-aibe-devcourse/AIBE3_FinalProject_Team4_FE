'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteShorlog } from '@/src/app/components/shorlog/edit/api';
import FollowButton from '../../common/FollowButton';

interface Props {
  username: string;
  nickname: string;
  profileImgUrl: string | null;
  isOwner?: boolean;
  shorlogId?: number;
  userId?: number;
}

export default function ShorlogAuthorHeader({
  username,
  nickname,
  profileImgUrl,
  isOwner = false,
  shorlogId,
  userId,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuAction = (action: string) => {
    setMenuOpen(false);

    if (action === '수정') {
      if (shorlogId) {
        router.push(`/shorlog/${shorlogId}/edit`);
      }
      return;
    }

    if (action === '삭제') {
      setShowDeleteModal(true);
      return;
    }

    // TODO: 블로그 연결 기능 구현
    alert(`${action} 기능은 추후 제공될 예정입니다.`);
  };

  const handleDelete = async () => {
    if (!shorlogId) return;

    setIsDeleting(true);
    try {
      await deleteShorlog(shorlogId.toString());
      alert('숏로그가 삭제되었습니다.');
      router.push(`/profile/${userId}`);
    } catch (error) {
      console.error('삭제 오류:', error);
      alert(error instanceof Error ? error.message : '숏로그 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
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
        {!isOwner && userId && (
          <FollowButton userId={userId} variant="small" />
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

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[320px] overflow-hidden rounded-3xl bg-white text-center shadow-xl">
            <div className="px-6 pt-6 pb-3">
              <p className="text-sm font-semibold text-slate-900">
                숏로그를 삭제하시겠습니까?
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                삭제된 숏로그는 복구할 수 없습니다.
              </p>
            </div>
            <div className="border-t border-slate-200 text-sm">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="block w-full px-4 py-3 font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
              <div className="h-px bg-slate-200" />
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="block w-full px-4 py-3 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
