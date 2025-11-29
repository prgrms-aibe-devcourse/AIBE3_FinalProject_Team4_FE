'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { Clock, Search, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchPanel({ onClose }: { onClose: () => void }) {
  const { isLogin } = useAuth();

  const [keyword, setKeyword] = useState('');

  const recommendedKeywords = [
    '생활형 베스트',
    '서울 숨은 맛집',
    'Spring Boot',
    '한국 뉴스',
    'BlackPink',
    '생성형 AI',
    '낭동 찾기',
    '일상 공유',
  ];

  const recentKeywords = isLogin
    ? ['생물학 테스트', '서울 숨은 맛집', 'Spring Boot', '한국 뉴스']
    : [];

  const autoList = keyword
    ? [
        `${keyword} 강의`,
        `${keyword} console`,
        `${keyword} 추천`,
        `${keyword} ec2`,
        `${keyword} s3`,
      ]
    : [];

  const showRecommendedOnly = !keyword && !isLogin;
  const showRecentAndRecommend = !keyword && isLogin;
  const showAutoResults = keyword.length > 0;

  return (
    <div>
      {/* ====== 패널 영역 ====== */}
      <div
        className="
          fixed left-20 top-0 
          w-80 h-screen 
          bg-white border-r border-gray-200 
          shadow-md 
          animate-slideIn 
          z-50
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-10 h-16">
          <h2 className="text-xl font-semibold">검색</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 relative px-4 py-2">
          <input
            type="text"
            autoFocus
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="
                w-full h-10 bg-gray-100 rounded-full pl-4 pr-10
                text-[15px] outline-none border border-gray-200
                focus:bg-white focus:ring-2 focus:ring-blue-100 transition
              "
          />

          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:bg-gray-200 rounded-full"
            ></button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {showAutoResults && (
            <div>
              <ul className="space-y-2">
                {autoList.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <Search size={18} className="text-gray-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showRecentAndRecommend && (
            <>
              <div>
                <h3 className="text-sm text-gray-500 mb-2">최근 검색어</h3>
                <ul className="space-y-1">
                  {recentKeywords.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <Clock size={12} className="text-gray-600" />
                      </div>
                      {item}
                      <div className="ml-auto p-1">
                        <X size={12} className="text-gray-600 hover:bg-gray-200 rounded-full" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-2">추천 검색어</h3>
                <ul className="space-y-1">
                  {recommendedKeywords.map((item) => (
                    <li
                      key={item}
                      className="px-1 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {showRecommendedOnly && (
            <div>
              <h3 className="text-sm text-gray-500 mb-2">추천 검색어</h3>
              <ul className="space-y-1">
                {recommendedKeywords.map((item) => (
                  <li key={item} className="px-1 py-1 rounded-lg hover:bg-gray-100 cursor-pointer">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
