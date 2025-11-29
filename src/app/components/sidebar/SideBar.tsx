'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import MorePanel from './panel/MorePanel';
import SearchPanel from './panel/SearchPanel';
import { guestMenu, loggedInMenu } from './SideBarMenu';

type OpenPanel = 'none' | 'more' | 'search';

export default function Sidebar() {
  const { loginUser, isLogin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel>('none');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarKeyword, setSidebarKeyword] = useState('');

  const pathname = usePathname();
  const router = useRouter();

  // 패널 ref들 (외부 클릭 감지용)
  const moreModalRef = useRef<HTMLDivElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const menu = isLogin ? loggedInMenu : guestMenu;

  const isMoreOpen = openPanel === 'more';
  const isSearchOpen = openPanel === 'search';

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

  // 외부 클릭 시 패널 공통 닫기 (More, Search 모두 여기서 처리)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showLogoutModal) return;

      const target = e.target as Node;

      const clickedInsideMore = moreModalRef.current && moreModalRef.current.contains(target);
      const clickedInsideSearch =
        searchWrapperRef.current && searchWrapperRef.current.contains(target);

      // 🔹 검색 패널이 열려 있을 때 바깥 클릭 → 닫기
      if (openPanel === 'search' && !clickedInsideSearch) {
        setOpenPanel('none');
        if (window.innerWidth >= 1280) {
          setIsCollapsed(false);
        }
        return;
      }

      // 🔹 더보기 패널이 열려 있을 때 바깥 클릭 → 닫기
      if (openPanel === 'more' && !clickedInsideMore) {
        setOpenPanel('none');
        if (window.innerWidth >= 1280) {
          setIsCollapsed(false);
        }
        return;
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLogoutModal, openPanel]);

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-20' : 'w-60'}
        bg-white border-r border-gray-200 h-screen fixed flex flex-col transition-all duration-300
      `}
    >
      {/* ======================= HEADER ======================= */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
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
      {/* ======================= SEARCH AREA + PANEL WRAPPER ======================= */}
      <div ref={searchWrapperRef}>
        <div className="px-4 py-1 flex justify-start">
          <div
            onClick={() => {
              if (isSearchOpen) {
                // 이미 열려있으면 → 닫기 + 사이드바 확장
                setOpenPanel('none');
                if (window.innerWidth >= 1280) {
                  setIsCollapsed(false);
                }
                return;
              }
              // 닫혀있으면 → 열기 + 사이드바 축소
              setOpenPanel('search');
              setIsCollapsed(true);
            }}
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
            {/* 🔍 아이콘 */}
            <div
              className="
          absolute left-3 top-1/2 -translate-y-1/2 
          flex items-center justify-center w-7 h-7 pointer-events-none
        "
            >
              <Search size={22} />
            </div>

            <input
              type="text"
              readOnly
              value={sidebarKeyword}
              placeholder="Search"
              className={`
          bg-transparent text-sm outline-none
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}
        `}
            />
          </div>
        </div>

        {/* 검색 패널 */}
        {isSearchOpen && (
          <SearchPanel
            onClose={() => {
              setOpenPanel('none');
              if (window.innerWidth >= 1280) {
                setIsCollapsed(false);
              }
            }}
            onSearch={(keyword: string) => setSidebarKeyword(keyword)}
          />
        )}
      </div>

      {/* ======================= MENU LIST ======================= */}
      <nav className="flex-1 px-3 space-y-1 text-[15px]">
        {menu.map((item) => {
          const isActive =
            item.href === '/profile' ? pathname.startsWith('/profile') : pathname === item.href;

          if (item.label === '더보기') {
            return (
              <div key={item.label} className="relative group" ref={moreModalRef}>
                <button
                  onClick={() => {
                    if (isMoreOpen) {
                      // 이미 열려있으면 → 닫기
                      setOpenPanel('none');
                      if (window.innerWidth >= 1280) setIsCollapsed(false);
                    } else {
                      // 더보기 패널 열기
                      setOpenPanel('more');
                      setIsCollapsed(true);
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                    ${isMoreOpen ? 'text-blue-600 font-medium' : 'text-gray-800 hover:bg-gray-100'}
                  `}
                >
                  <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">
                    <item.icon size={24} />
                  </div>

                  <span
                    className={`
                      whitespace-nowrap transition-all duration-300
                      ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
                    `}
                  >
                    {item.label}
                  </span>
                </button>

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

                {/* 더보기 패널 */}
                {isMoreOpen && (
                  <MorePanel
                    onClose={() => {
                      setOpenPanel('none');
                      if (window.innerWidth >= 1280) {
                        setIsCollapsed(false);
                      }
                    }}
                    showLogoutModal={showLogoutModal}
                    setShowLogoutModal={setShowLogoutModal}
                  />
                )}
              </div>
            );
          }

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
