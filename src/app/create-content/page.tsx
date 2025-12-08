'use client';

import React from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateContentPage() {
  const router = useRouter();

  const handleSelectShorlog = () => {
    router.push('/shorlog/create');
  };

  const handleSelectBlog = () => {
    router.push('/blogs/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="flex min-h-screen items-center justify-center py-8 pr-8 pl-4">
        {/* 중앙 선택 카드 */}
        <div className="w-full max-w-[680px] rounded-[2rem] bg-white/80 backdrop-blur-sm px-10 pb-10 pt-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] ring-1 ring-white/20 border border-white/30">
          {/* Header */}
          <header className="mb-10 text-center">
            <p className="text-[11px] font-medium tracking-[0.18em] text-[#2979FF] uppercase">
              NEW CONTENT
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              무엇을 만드시겠어요?
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              지금 만들고 싶은 형식을 선택하세요.
              <br />
              <span className="font-medium text-[#2979FF]">숏로그</span>와{' '}
              <span className="font-medium text-emerald-600">블로그</span>는 각각 독립적으로
              생성되고, 필요할 때 서로 연결할 수 있어요.
            </p>
          </header>
          {/* 옵션 카드들 */}
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            {/* 숏로그 카드 */}
            <button
              type="button"
              onClick={handleSelectShorlog}
              className="group flex-1 rounded-3xl border-2 border-slate-200/80 bg-gradient-to-br from-white to-blue-50/30 p-8 text-left shadow-xl transition-all duration-300 hover:border-[#2979FF]/50 hover:bg-gradient-to-br hover:from-[#f3f6ff] hover:to-blue-100/40 hover:shadow-2xl hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2979FF]/30"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2979FF] to-[#1565C0] text-white shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <ImageIcon size={36} />
                </div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#2979FF]/10 px-3 py-1 text-xs font-medium text-[#2979FF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2979FF]"></span>
                  SHORLOG
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#2979FF] transition-colors">
                  숏로그
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  이미지와 함께 짧고 임팩트 있게
                  <br />
                  <span className="font-medium text-slate-700">순간을 기록해 보세요</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 group-hover:bg-[#2979FF]/10 group-hover:text-[#2979FF] transition-all">
                    📸 이미지 필수
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 group-hover:bg-[#2979FF]/10 group-hover:text-[#2979FF] transition-all">
                    ✏️ 최대 800자
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-base font-semibold text-[#2979FF] group-hover:gap-3 transition-all">
                  <span>숏로그 작성하기</span>
                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </button>

            {/* 블로그 카드 */}
            <button
              type="button"
              onClick={handleSelectBlog}
              className="group flex-1 rounded-3xl border-2 border-slate-200/80 bg-gradient-to-br from-white to-emerald-50/30 p-8 text-left shadow-xl transition-all duration-300 hover:border-emerald-500/50 hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-emerald-100/40 hover:shadow-2xl hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <FileText size={36} />
                </div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  BLOG
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  블로그
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  긴 글과 다양한 콘텐츠로
                  <br />
                  <span className="font-medium text-slate-700">깊이 있는 이야기를 남겨 보세요</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-all">
                    📝 자유 형식
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-all">
                    🎨 마크다운 지원
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-base font-semibold text-emerald-600 group-hover:gap-3 transition-all">
                  <span>블로그 작성하기</span>
                  <span className="text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}