import ShorlogFeedPageClient from '../../components/shorlog/feed/ShorlogFeedPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TexTok',
};

export default function ShorlogFeedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
      {/* ✅ max-w / mx-auto 제거하고, 메인 영역 전체 너비 사용 */}
      <div className="px-4 pb-16 pt-8 md:px-8 md:pt-12 xl:px-12 2xl:px-16">
        <header className="mb-6 md:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            SHORLOG FEED
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            숏 피드
          </h1>
          <p className="mt-3 text-sm text-slate-500 md:text-base">
            짧은 글을 스와이프로 훑어보고, 더 보고 싶은 콘텐츠만 깊게 읽어보세요.
          </p>
        </header>

        <ShorlogFeedPageClient />
      </div>
    </div>
  );
}
