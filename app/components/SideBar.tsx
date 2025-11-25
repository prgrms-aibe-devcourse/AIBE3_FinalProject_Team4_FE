'use client';

import { Bell, Home, Image, Search, Settings, User } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const [selectedMenu, setSelectedMenu] = useState('홈');

  const menuItems = [
    { icon: Home, label: '메인' },
    { icon: Image, label: '숏피드' },
    { icon: Image, label: '롱피드' },
    { icon: Image, label: '작성' },
    { icon: Bell, label: '알림' },
    { icon: User, label: '프로필' },
    { icon: Settings, label: '설정' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
      {/* 로고 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-xl">TEXTOK</span>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setSelectedMenu(item.label)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              selectedMenu === item.label
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 로그인 버튼 */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
          로그인
        </button>
      </div>

      {/* 검색 */}
      <div className="p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
