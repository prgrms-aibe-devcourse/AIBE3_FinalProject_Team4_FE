'use client';

import { useState } from 'react';
import FreeImagePanel from './FreeImagePanel';
import FromBlogPanel from './FromBlogPanel';
import UploadPanel from './UploadPanel';

const TABS = [
  { key: 'upload', label: '이미지 업로드' },
  { key: 'fromBlog', label: '블로그에서 가져오기' },
  { key: 'free', label: '무료 이미지 추천 받기' },
];

export default function ThumbnailModal() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">섬네일 이미지</h2>
      <p className="text-sm text-slate-500 mb-6">
        포스트의 내용을 알려주는 사진을 선택하거나 업로드하세요
      </p>

      {/* 탭 */}
      <div className="flex border-b mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === t.key
                ? 'border-[#2979FF] text-[#2979FF]'
                : 'border-transparent text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 패널 */}
      <div className="">
        {activeTab === 'upload' && <UploadPanel />}
        {activeTab === 'fromBlog' && <FromBlogPanel />}
        {activeTab === 'free' && <FreeImagePanel />}
      </div>

      {/* 하단 CTA */}
      <div className="mt-8 flex justify-end">
        <button className="px-6 py-2 rounded-xl bg-[#2979FF] text-white shadow-sm hover:opacity-90 transition">
          적용하기
        </button>
      </div>
    </div>
  );
}
