'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useMessagesUnreadStore } from '@/src/stores/useMessagesUnreadStore';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import NotificationDropdown from '../notifications/NotificationDropDown';
import MorePanel from './panel/MorePanel';
import SearchPanel from './panel/SearchPanel';
import { guestMenu, loggedInMenu } from './SideBarMenu';
type OpenPanel = 'none' | 'more' | 'search';

export default function Sidebar() {
  const { loginUser, isLogin } = useAuth();
  const { open } = useLoginModal();

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const unreadMessagesCount = useMessagesUnreadStore((s) => s.unreadCount);

  const [openNotification, setOpenNotification] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel>('none');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarKeyword, setSidebarKeyword] = useState('');

  const pathname = usePathname();
  const router = useRouter();

  const moreModalRef = useRef<HTMLDivElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const menuData = isLogin ? loggedInMenu : guestMenu;
  const menu = typeof menuData === 'function' ? menuData(0) : menuData;

  const isMoreOpen = openPanel === 'more';
  const isSearchOpen = openPanel === 'search';
  const protectedMenus = ['프로필', '작성'];

  const openPanelFn = (panel: OpenPanel) => {
    setOpenPanel(panel);
    setIsCollapsed(true);
  };

  const closePanelFn = () => {
    setOpenPanel('none');
    setIsCollapsed(false);
  };

  const goHome = () => {
    router.push('/');
  };

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        if (openPanel === 'none') {
          setIsCollapsed(false);
        }
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openPanel]);

  // 외부 클릭 시 패널 닫기
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

  // 검색 페이지 벗어나면 search keyword 제거
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
      <div className="pl-1 pr-1 pt-5 pb-2 flex items-center justify-center">
        {/* 1) 접혔을 때만 보이는 책 아이콘 버튼 */}
        {isCollapsed && (
          <button
            type="button"
            onClick={goHome}
            className="flex items-center justify-center rounded-xl text-slate-900 transition"
          >
            <Image
              src="/icons/book.png"
              alt="텍스톡 아이콘"
              width={48}
              height={39}
              className="object-contain"
            />
          </button>
        )}

        {/* 2) 펼쳤을 때만 보이는 가로형 로고 */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={goHome}
            className="flex items-center justify-center transition py-2"
          >
            <Image
              src="/icons/logo.png"
              alt="textok 로고"
              width={145}
              height={44}
              className="object-contain"
            />
          </button>
        )}
      </div>

      {/* SEARCH WRAPPER */}
      <div ref={searchWrapperRef}>
        <div className="px-5 pt-2 pb-1">
          <div
            onClick={() => {
              if (isSearchOpen) closePanelFn();
              else openPanelFn('search');
            }}
            className={`
        relative flex items-center cursor-pointer overflow-hidden
        transition-all duration-200
        mx-auto
        ${
          isCollapsed
            ? 'h-10 w-10 justify-center rounded-full'
            : 'h-10 w-full rounded-full pl-10 pr-3 border'
        }
        ${
          isSearchOpen
            ? 'bg-sky-50 border-sky-200 text-[#2979FF]'
            : isCollapsed
              ? ' text-slate-600 hover:bg-slate-100'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
        }
      `}
          >
            {/* 아이콘 */}
            <div
              className={`
          flex items-center justify-center
          ${
            isCollapsed
              ? 'h-6 w-6 text-slate-600'
              : 'pointer-events-none absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400'
          }
        `}
            >
              <Search size={18} />
            </div>

            <input
              type="text"
              readOnly
              value={sidebarKeyword}
              placeholder="검색어를 입력하세요"
              className={`
          bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400
          transition-all duration-200
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

      {/* MENU LIST */}
      <nav className="flex-1 px-3 space-y-1 text-[15px]">
        {menu.map((item) => {
          const isActive =
            item.href === '/profile' ? pathname.startsWith('/profile') : pathname === item.href;

          const isProfile = item.label === '프로필';
          const isProtected = protectedMenus.includes(item.label);

          if (item.label === '더보기') {
            return (
              <div key={item.label} className="relative group" ref={moreModalRef}>
                <button
                  onClick={() => {
                    if (isMoreOpen) closePanelFn();
                    else openPanelFn('more');
                  }}
                  className={`
          w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-all
          ${isMoreOpen ? 'text-blue-600 font-medium bg-slate-50' : 'text-gray-600 hover:bg-gray-100'}
        `}
                >
                  {/* 아이콘 영역 – 다른 메뉴와 동일한 폭/정렬 */}
                  <div
                    className={`
            flex items-center justify-center flex-shrink-0
           ${
             isMoreOpen
               ? 'text-[#2979FF]'
               : isCollapsed
                 ? ' text-slate-600 hover:bg-slate-100'
                 : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
           }
          `}
                  >
                    <item.icon size={20} />
                  </div>

                  {/* 라벨 – 접히면 숨기고, 펼치면 보이기 */}
                  <span
                    className={`
            whitespace-nowrap transition-all duration-300
            ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
          `}
                  >
                    {item.label}
                  </span>
                </button>

                {/* 접힌 상태에서 툴팁 */}
                {isCollapsed && (
                  <span className="absolute left-20 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
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
                  if (item.label === '알림') {
                    setOpenNotification((prev) => !prev);
                    return;
                  }
                  if (isProtected && !isLogin) {
                    open();
                    return;
                  }

                  if (isProfile && isLogin && loginUser) {
                    router.push(`/profile/${loginUser.id}`);
                    return;
                  }

                  // 숏피드 버튼 클릭 시 강제 새로고침 (숏피드/프로필 페이지에서)
                  if (
                    item.href === '/shorlog/feed' &&
                    (pathname.startsWith('/shorlog') || pathname.startsWith('/profile'))
                  ) {
                    window.location.href = '/shorlog/feed';
                    return;
                  }

                  router.push(item.href);
                }}
                className={`
              w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-all
              ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}
            `}
              >
                <div
                  className={`
    relative flex items-center justify-center flex-shrink-0
    ${isCollapsed ? 'w-6 h-6' : 'w-7 h-7'}
  `}
                >
                  {isProfile && isLogin ? (
                    <img
                      src={loginUser?.profileImgUrl || '/tmpProfile.png'}
                      alt="profile"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`
                        relative flex items-center justify-center flex-shrink-0
                        ${isCollapsed ? 'w-6 h-6' : 'w-7 h-7'}
                      `}
                    >
                      <item.icon size={20} />

                      {item.label === '메시지' && unreadMessagesCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                      )}

                      {item.label === '알림' && unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                      )}
                    </div>
                  )}
                </div>

                {/* 라벨 */}
                <span
                  className={`
                    whitespace-nowrap transition-all
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
      {/* 알림 드롭다운 */}
      {openNotification && <NotificationDropdown onClose={() => setOpenNotification(false)} />}
    </aside>
  );
}
