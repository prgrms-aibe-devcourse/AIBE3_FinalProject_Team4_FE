import type { Metadata } from 'next';
import ShorlogFeedPageClient from '../../components/shorlog/feed/ShorlogFeedPageClient';

export const metadata: Metadata = {
  title: 'TexTok',
};

export default function ShorlogFeedPage() {
  return (
    <>
      <header className="mb-6 md:mb-8 px-3">
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
    </>
  );
}
