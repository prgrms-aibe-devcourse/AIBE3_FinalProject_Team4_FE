import ShorlogFeedPageClient from '../../components/shorlog/feed/ShorlogFeedPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TexTok',
};

export default function ShorlogFeedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8 md:pt-12">
        <header className="mb-6 md:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            SHORLOG FEED
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            숏 피드
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-500">
            짧은 글을 스와이프로 훑어보고, 더 보고 싶은 콘텐츠만 깊게 읽어보세요.
          </p>
        </header>

        <ShorlogFeedPageClient />
      </div>
    </div>
  );
}
