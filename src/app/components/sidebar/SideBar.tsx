'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { guestMenu, loggedInMenu } from './SideBarMenu';

export default function Sidebar() {
  const { loginUser, isLogin, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const moreModalRef = useRef<HTMLDivElement>(null);

  const menu = isLogin ? loggedInMenu : guestMenu;

  // 화면 크기에 따라 자동으로 collapse
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true); // 브라우저가 좁아지면 자동 축소
      } else {
        setIsCollapsed(false); // 다시 넓어지면 자동 확장
      }
    }

    handleResize(); // 초기 실행
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 외부 클릭 시 popover 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreModalRef.current && !moreModalRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    setIsMoreOpen(false);
    await logout();
  };

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-20' : 'w-60'}
        bg-white border-r border-gray-200 h-screen fixed flex flex-col transition-all duration-300
      `}
    >
      {/* ======================= HEADER (로고 + 축소 토글) ======================= */}
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
            📝
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-xl">TEXTOK</span>
            </div>
          )}
        </div>
      </div>

      {/* ======================= SEARCH AREA ======================= */}
      <div className="px-4 py-4 flex justify-center">
        {isCollapsed ? (
          // 축소 모드 → 원형 안에 검색 아이콘, 크기 정렬 통일
          <button
            onClick={() => setIsCollapsed(false)}
            className="
              w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center 
              hover:bg-gray-200 transition
            "
          >
            <Search size={22} className="text-gray-700" />
          </button>
        ) : (
          // 확장 모드 → 검색바 내부 아이콘도 정렬 축 통일
          <div className="relative w-full cursor-pointer" onClick={() => setIsCollapsed(true)}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7">
              <Search size={22} className="text-gray-700" />
            </div>

            <input
              type="text"
              placeholder="Search"
              className="
                w-full pl-12 pr-3 py-2 bg-gray-100 rounded-full text-sm border border-gray-200
                focus:outline-none focus:border-blue-500
              "
            />
          </div>
        )}
      </div>

      {/* ======================= MENU LIST ======================= */}
      <nav className="flex-1 px-3 space-y-1 text-[15px]">
        {menu.map((item) => {
          const isActive =
            item.href === '/profile' ? pathname.startsWith('/profile') : pathname === item.href;

          return (
            <div key={item.label} className="relative group">
              <Link
                href={item.href}
                className={`
                  flex items-center 
                  ${isCollapsed ? 'justify-center' : 'justify-start gap-3 px-4'}
                  py-2 rounded-lg transition-all
                  ${isActive ? 'text-blue-600 font-medium' : 'text-gray-800 hover:bg-gray-100'}
                `}
              >
                <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">
                  <item.icon size={24} />
                </div>

                {!isCollapsed && <span>{item.label}</span>}
              </Link>

              {/* 축소 모드 툴팁 */}
              {isCollapsed && (
                <span
                  className="
                    absolute left-20 top-1/2 -translate-y-1/2
                    px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0
                    group-hover:opacity-100 transition pointer-events-none 
                    whitespace-nowrap
                  "
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}

        {/* 로그인 버튼 (확장일때만) */}
        {!isLogin && !isCollapsed && (
          <div className="pt-2 pb-6 border-b border-gray-200">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              로그인
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}
