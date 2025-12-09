'use client';

import { useRouter } from 'next/navigation';

type PrimaryTab = 'mine' | 'bookmark';
type SecondaryTab = 'short' | 'long';

interface ProfileEmptyStateProps {
  isMyPage: boolean;
  primaryTab: PrimaryTab;
  secondaryTab: SecondaryTab;
}

export function ProfileEmptyState({ isMyPage, primaryTab, secondaryTab }: ProfileEmptyStateProps) {
  const router = useRouter();

  const isBookmark = primaryTab === 'bookmark';
  const isShorlog = secondaryTab === 'short';

  const title = (() => {
    if (isMyPage) {
      if (isBookmark) return isShorlog ? '북마크한 숏로그가 없어요.' : '북마크한 블로그가 없어요.';
      return isShorlog ? '아직 숏로그가 없어요.' : '아직 블로그가 없어요.';
    }
    return isShorlog ? '아직 공개된 숏로그가 없어요.' : '아직 공개된 블로그가 없어요.';
  })();

  const desc = (() => {
    if (isMyPage) {
      if (isBookmark) {
        return isShorlog
          ? '마음에 드는 숏로그를 북마크해두면 여기에서 모아볼 수 있어요.'
          : '좋아하는 글을 북마크해두면 여기에서 다시 쉽게 찾아볼 수 있어요.';
      }
      return isShorlog
        ? '짧은 기록을 가볍게 남겨보세요. 쌓이면 나만의 흐름이 돼요.'
        : '길게 남기고 싶은 생각을 기록해 보세요. 한 편씩 차곡차곡 쌓여요.';
    }
    return isShorlog
      ? '이 사용자가 공유한 숏로그가 아직 없어요.'
      : '이 사용자가 공유한 블로그 글이 아직 없어요.';
  })();

  const cta = (() => {
    if (!isMyPage) return null;
    if (isBookmark) return null;

    return isShorlog
      ? { href: '/create-content', label: '숏로그 작성하러 가기' }
      : { href: '/blogs/new', label: '블로그 작성하러 가기' };
  })();

  const handleGo = (href: string) => {
    router.push(href);
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl px-4 py-12 text-center">
      <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-slate-700 shadow-sm">
        <span className="text-lg">✏️</span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-[28rem] text-xs leading-relaxed text-slate-500">{desc}</p>

      {cta && (
        <button
          type="button"
          onPointerDown={(e) => {
            // 상위에서 pointer 이벤트 가로채는 케이스 대비
            e.preventDefault();
          }}
          onClick={() => handleGo(cta.href)}
          className="mt-5 inline-flex items-center rounded-full bg-[#2979FF] px-4 py-2 text-xs font-semibold text-white shadow-sm transition
          hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50"
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}
