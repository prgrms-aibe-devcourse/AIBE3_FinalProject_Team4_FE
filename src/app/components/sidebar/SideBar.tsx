'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import MorePanel from './panel/MorePanel';
import SearchPanel from './panel/SearchPanel';
import { guestMenu, loggedInMenu } from './SideBarMenu';

type OpenPanel = 'none' | 'more' | 'search';

export default function Sidebar() {
  const { loginUser, isLogin } = useAuth();
  const { open } = useLoginModal();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel>('none');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarKeyword, setSidebarKeyword] = useState('');

  const pathname = usePathname();
  const router = useRouter();

  const moreModalRef = useRef<HTMLDivElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const menu = isLogin ? loggedInMenu : guestMenu;

  const isMoreOpen = openPanel === 'more';
  const isSearchOpen = openPanel === 'search';
  const protectedMenus = ['프로필', '작성'];

  const openPanelFn = (panel: OpenPanel) => {
    setOpenPanel(panel);
    setIsCollapsed(true); // 패널 열면 자동 축소
  };

  const closePanelFn = () => {
    setOpenPanel('none');
    setIsCollapsed(false); // 패널 닫으면 원래 크기
  };

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        // 패널이 열려있으면 collapsed 유지
        if (openPanel === 'none') {
          setIsCollapsed(false);
        }
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openPanel]);

  /* ============================================================
        외부 클릭 시 패널 닫기 (collapse는 변경 금지!)
     ============================================================ */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showLogoutModal) return;

      const target = e.target as Node;

      const clickedInsideMore = moreModalRef.current && moreModalRef.current.contains(target);
      const clickedInsideSearch =
        searchWrapperRef.current && searchWrapperRef.current.contains(target);

      if (openPanel === 'search' && !clickedInsideSearch) {
        closePanelFn();
        return;
      }

      if (openPanel === 'more' && !clickedInsideMore) {
        closePanelFn();
        return;
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPanel, showLogoutModal]);

  /* ============================================================
        검색 페이지 벗어난 경우 사이드바 검색어 초기화
     ============================================================ */
  useEffect(() => {
    if (!pathname.startsWith('/search')) {
      setSidebarKeyword('');
    }
  }, [pathname]);

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-20' : 'w-60'}
        bg-white border-r border-gray-200
        h-screen fixed flex flex-col
        transition-all duration-300
        z-[60]
      `}
    >
      {/* ================= HEADER ================= */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
            📝
          </div>

          <div
            className={`
              transition-all overflow-hidden
              ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}
          >
            <span className="font-bold text-xl whitespace-nowrap">TEXTOK</span>
          </div>
        </div>
      </div>

      {/* =============== SEARCH + PANEL WRAPPER =============== */}
      <div ref={searchWrapperRef}>
        <div className="px-4 py-1 flex justify-start">
          <div
            onClick={() => {
              if (isSearchOpen) closePanelFn();
              else openPanelFn('search');
            }}
            className={`
              relative flex items-center cursor-pointer overflow-hidden
              transition-all duration-300 ease-in-out
              ${
              isCollapsed
                ? 'w-10 h-10 rounded-full justify-center'
                : 'w-full h-10 rounded-full bg-gray-100 pl-12 pr-3 border border-gray-200'
            }
            `}
          >
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2
                         flex items-center justify-center w-7 h-7 pointer-events-none"
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
                transition-all duration-300
                ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}
              `}
            />
          </div>
        </div>

        {isSearchOpen && (
          <SearchPanel
            initialKeyword={sidebarKeyword}
            onClose={closePanelFn}
            onSearch={(keyword: string) => setSidebarKeyword(keyword)}
          />
        )}
      </div>

      {/* ======================= MENU LIST ======================= */}
      <nav className="flex-1 px-3 space-y-1 text-[15px]">
        {menu.map((item) => {
          const isActive =
            item.href === '/profile' ? pathname.startsWith('/profile') : pathname === item.href;

          const isProtected = protectedMenus.includes(item.label);
          const isProfile = item.label === '프로필';

          if (item.label === '더보기') {
            return (
              <div key={item.label} className="relative group" ref={moreModalRef}>
                <button
                  onClick={() => {
                    if (isMoreOpen) closePanelFn();
                    else openPanelFn('more');
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

                {isCollapsed && (
                  <span
                    className="
                      absolute left-20 top-1/2 -translate-y-1/2
                      px-2 py-1 bg-gray-900 text-white text-xs rounded
                      opacity-0 group-hover:opacity-100 transition pointer-events-none
                    "
                  >
                    {item.label}
                  </span>
                )}

                {isMoreOpen && (
                  <MorePanel
                    onClose={closePanelFn}
                    showLogoutModal={showLogoutModal}
                    setShowLogoutModal={setShowLogoutModal}
                  />
                )}
              </div>
            );
          }

          return (
            <div key={item.label} className="relative group">
              <button
                onClick={() => {
                  // 로그인 필요한 메뉴인데 로그인 안됨 → 모달 열기
                  if (isProtected && !isLogin) {
                    open();
                    return;
                  }

                  if (isProfile && isLogin && loginUser) {
                    router.push(`/profile/${loginUser.id}`);
                    return;
                  }
                  
                  // 숏피드 링크 클릭 시 이미 숏피드 페이지에 있으면 강제 새로고침
                  if (item.href === '/shorlog/feed' && pathname.startsWith('/shorlog')) {
                    window.location.href = '/shorlog/feed';
                    return;
                  }

                  router.push(item.href);
                }}
                className={`
              w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-all
              ${isActive ? 'text-blue-600 font-medium' : 'text-gray-800 hover:bg-gray-100'}
            `}
              >
                <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">
                  {isProfile && isLogin ? (
                    <img
                      src={loginUser?.profileImgUrl || '/tmpProfile.png'}
                      alt="profile"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <>
                      <item.icon size={24} />
                      {item.alert && (
                        <span className="absolute -top-1.5 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </>
                  )}
                </div>

                <span
                  className={`
                whitespace-nowrap transition-all
                ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
              `}
                >
                  {item.label}
                </span>
              </button>

              {/* Hover Tooltip */}
              {isCollapsed && (
                <span
                  className="
                absolute left-20 top-1/2 -translate-y-1/2
                px-2 py-1 bg-gray-900 text-white text-xs rounded
                opacity-0 group-hover:opacity-100 transition pointer-events-none
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
              onClick={() => open()}
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
