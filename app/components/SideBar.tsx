'use client';

import { cn } from '@/app/lib/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  // TODO: 로그인 여부 연동 가능
  const isLoggedIn = false; // 임시

  const menu = isLoggedIn ? loggedInMenu : guestMenu;

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

      {/* 메뉴 리스트 */}
      <nav className="px-4 space-y-1 text-[15px]">
        {menu.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive ? 'text-blue-600 font-medium' : 'text-gray-800 hover:bg-gray-100',
              )}
            >
              <div className="relative">
                <item.icon size={20} strokeWidth={2} />
                {/* alert badge */}
                {item.alert && (
                  <span className="absolute -top-1.5 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* 비로그인일 때만 로그인 버튼 */}
        {!isLoggedIn && (
          <div className="pt-2 pb-6 border-b border-gray-200">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
              로그인
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}
