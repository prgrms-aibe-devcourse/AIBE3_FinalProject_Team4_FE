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
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    }

    handleResize();
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
      {/* ======================= HEADER ======================= */}
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* FIXED: 아이콘 크기 고정 */}
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
            📝
          </div>

          {/* label만 나타나고 사라짐 — 아이콘 위치는 고정 */}
          <div
            className={`
              overflow-hidden transition-all 
              ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}
          >
            <span className="font-bold text-xl whitespace-nowrap">TEXTOK</span>
          </div>
        </div>
      </div>

      {/* ======================= SEARCH AREA ======================= */}
      <div className="px-4 py-3 flex justify-start">
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
                relative flex items-center 
                transition-all duration-300 ease-in-out 
                overflow-hidden cursor-pointer
            ${
              isCollapsed
                ? 'w-10 h-10 rounded-full justify-center'
                : 'w-full h-10 rounded-full bg-gray-100 pl-12 pr-3 border border-gray-200'
            }
          `}
        >
          {/* 🔍 아이콘 (항상 같은 위치에 고정) */}
          <div
            className="
              absolute left-3 top-1/2 -translate-y-1/2 
              flex items-center justify-center w-7 h-7 pointer-events-none
            "
          >
            <Search size={22} className={isCollapsed ? 'text-blue-600' : 'text-gray-700'} />
          </div>

          {/* input은 확장 모드일 때만 렌더
        collapse에서는 width:0 되도록 해서 자연스럽게 사라짐 */}
          <input
            type="text"
            readOnly
            placeholder="Search"
            className={`
              bg-transparent text-sm outline-none
              transition-all duration-300 ease-in-out
              ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}
            `}
          />
        </div>
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
                  flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                  ${isActive ? 'text-blue-600 font-medium' : 'text-gray-800 hover:bg-gray-100'}
                `}
              >
                {/* FIXED: 아이콘 위치 완전 고정 */}
                <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">
                  {item.label === '프로필' && isLogin ? (
                    <img
                      src={loginUser?.profileImgUrl || '/tmpProfile.png'}
                      alt="profile"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <item.icon size={24} />
                  )}
                </div>

                {/* label만 사라짐 — 아이콘은 그대로 */}
                <span
                  className={`
                    whitespace-nowrap transition-all
                    ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
                  `}
                >
                  {item.label}
                </span>
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
