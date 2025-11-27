'use client';

import {
  Bell,
  FileText,
  Home,
  Image,
  MessageCircle,
  MoreHorizontal,
  PlusSquare,
  Search,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type User = {
  id: number;
  nickname: string;
  profileImgUrl: string | null;
};

type MenuItem = {
  icon: any;
  label: string;
  href: string;
  alert?: boolean;
};

// 비로그인 메뉴
const guestMenu: MenuItem[] = [
  { icon: Home, label: '메인', href: '/' },
  { icon: Image, label: '숏로그', href: '/shorlog' },
  { icon: FileText, label: '블로그', href: '/blog' },
  { icon: Users, label: '팔로우', href: '/follow' },
  { icon: PlusSquare, label: '작성', href: '/write' },
  { icon: User, label: '프로필', href: '/profile' },
  { icon: MoreHorizontal, label: '더보기', href: '/more' },
];

// 로그인 메뉴
const loggedInMenu: MenuItem[] = [
  { icon: Home, label: '메인', href: '/' },
  { icon: Image, label: '숏로그', href: '/shorlog' },
  { icon: FileText, label: '블로그', href: '/blog' },
  { icon: Users, label: '팔로우', href: '/follow' },
  { icon: PlusSquare, label: '작성', href: '/write' },
  { icon: MessageCircle, label: '메시지', href: '/messages', alert: true },
  { icon: Bell, label: '알림', href: '/notifications', alert: true },
  { icon: User, label: '프로필', href: '/profile' },
  { icon: MoreHorizontal, label: '더보기', href: '/more' },
];

export default function Sidebar() {
  const [loginUser, setLoginUser] = useState<User | null>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const moreModalRef = useRef<HTMLDivElement>(null);

  // 사용자 정보 로드
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) return;

        const json = await res.json();
        setLoginUser(json.data);
      } catch (e) {
        console.error(e);
      }
    }

    fetchUser();
  }, []);

  const isLoggedIn = loginUser !== null;
  const menu = isLoggedIn ? loggedInMenu : guestMenu;

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreModalRef.current && !moreModalRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-60 bg-white border-r border-gray-200 h-screen fixed flex flex-col">
      {/* 로고 영역 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
            📝
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-xl">TEXTOK</span>
            <span className="text-[11px] text-gray-500">TEXT. POST. CONNECT.</span>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm border border-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 px-4 space-y-1 text-[15px] relative">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          const isProfileItem = item.label === '프로필';

          // ----- 더보기 버튼 예외 처리 -----
          if (item.label === '더보기') {
            return (
              <button
                key={item.label}
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={
                  `flex w-full items-center gap-3 px-4 py-2 rounded-lg transition-colors ` +
                  (isActive ? 'text-blue-600 font-medium' : 'text-gray-800 hover:bg-gray-100')
                }
              >
                <item.icon size={24} strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          }

          // ----- 일반 메뉴 -----
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ` +
                (isActive ? 'text-blue-600 font-medium' : 'text-gray-800 hover:bg-gray-100')
              }
            >
              <div className="relative flex items-center justify-center">
                {isProfileItem && isLoggedIn ? (
                  <img
                    src={loginUser.profileImgUrl ?? '/default-avatar.png'}
                    alt="profile icon"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <>
                    <item.icon size={24} strokeWidth={2} />
                    {item.alert && (
                      <span className="absolute -top-1.5 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </>
                )}
              </div>

              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* 더보기 모달 */}
        {isMoreOpen && (
          <div
            ref={moreModalRef}
            className="absolute bottom-24 left-4 w-44 bg-white border border-gray-200 shadow-md rounded-lg p-2 z-50"
          >
            <button
              onClick={() => {
                fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
                  method: 'DELETE',
                  credentials: 'include',
                }).then(() => {
                  window.location.reload();
                });
              }}
              className="w-full px-3 py-2 rounded-md text-left hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        )}
      </nav>

      {/* 비로그인 → 로그인 버튼 */}
      {!isLoggedIn && (
        <div className="px-4 pb-6">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            로그인
          </button>
        </div>
      )}
    </aside>
  );
}
