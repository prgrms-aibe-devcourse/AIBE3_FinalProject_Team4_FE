'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { guestMenu, loggedInMenu } from './SideBarMenu';
import SidebarMorePopover from './SideBarMorePopover';

export default function Sidebar() {
  const { loginUser, isLogin, logout } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const moreModalRef = useRef<HTMLDivElement>(null);
  const menu = isLogin ? loggedInMenu : guestMenu;

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

  const handleLogout = async () => {
    setIsMoreOpen(false); // 🔥 모달 강제 닫기
    await logout(); // 로그아웃 로직 실행 (라우터 이동 포함)
  };


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
          const isProfileItem = item.label === '프로필';
          const isActive =
            item.href === '/profile' ? pathname.startsWith('/profile') : pathname === item.href;

          if (item.label === '더보기') {
            return (
              isLogin && (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={
                      `flex w-full items-center gap-3 px-4 py-2 rounded-lg transition-colors ` +
                      (isActive ? 'text-blue-600 font-medium' : 'text-gray-800 hover:bg-gray-100')
                    }
                  >
                    <item.icon size={24} strokeWidth={2} />
                    <span>{item.label}</span>
                  </button>

                  {/* 로그인 상태일 때만 모달 렌더링 */}
                  {isMoreOpen && isLogin && (
                    <SidebarMorePopover
                      logout={handleLogout}
                      onClose={() => setIsMoreOpen(false)}
                    />
                  )}
                </div>
              )
            );
          }


          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                // 숏피드 링크 클릭 시 이미 숏피드 페이지에 있으면 강제 새로고침
                if (item.href === '/shorlog/feed' && pathname.startsWith('/shorlog')) {
                  e.preventDefault();
                  window.location.href = '/shorlog/feed';
                }
              }}
              className={
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ` +
                (isActive ? 'text-blue-600 font-medium' : 'text-gray-800 hover:bg-gray-100')
              }
            >
              <div className="relative flex items-center justify-center">
                {isProfileItem && isLogin ? (
                  <img
                    src={loginUser?.profileImgUrl || '/tmpProfile.png'}
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

        {!isLogin && (
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
