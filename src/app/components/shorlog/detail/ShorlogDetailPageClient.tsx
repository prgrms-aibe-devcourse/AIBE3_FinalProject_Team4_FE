'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ShorlogAuthorHeader from './ShorlogAuthorHeader';
import ShorlogCommentSection from './ShorlogCommentSection';
import ShorlogImageSlider from './ShorlogImageSlider';
import ShorlogReactionSection from './ShorlogReactionSection';
import ShorlogTtsController from './ShorlogTtsController';
import type { ShorlogDetail } from './types';

interface Props {
  detail: ShorlogDetail;
  isOwner?: boolean;
  hideNavArrows?: boolean;
}

function HighlightedContent({ content, progress }: { content: string; progress: number }) {
  const totalLength = content.length;

  if (totalLength === 0) {
    return <p className="text-sm leading-relaxed text-slate-400">아직 내용이 없습니다.</p>;
  }

  const clamped = Math.max(0, Math.min(progress, 1));
  const highlightLength = Math.floor(totalLength * clamped);

  if (highlightLength <= 0) {
    return <p className="whitespace-pre-line text-[15px] md:text-base leading-relaxed text-slate-900">{content}</p>;
  }

  if (highlightLength >= totalLength) {
    return (
      <p className="whitespace-pre-line text-[15px] md:text-base leading-relaxed text-slate-900">
        <span className="bg-sky-50">{content}</span>
      </p>
    );
  }

  const highlighted = content.slice(0, highlightLength);
  const remaining = content.slice(highlightLength);

  return (
    <p className="whitespace-pre-line text-[15px] md:text-base leading-relaxed text-slate-900">
      <span className="bg-sky-50">{highlighted}</span>
      <span>{remaining}</span>
    </p>
  );
}

function PrevNextNavArrows({ currentId }: { currentId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);

  useEffect(() => {
    let prev = searchParams.get('prev');
    let next = searchParams.get('next');

    if (!prev || !next) {
      if (typeof window !== 'undefined') {
        const feedIdsStr = sessionStorage.getItem('shorlog_feed_ids');
        if (feedIdsStr) {
          try {
            const feedIds: number[] = JSON.parse(feedIdsStr);
            const currentIndex = feedIds.findIndex(id => id === currentId);

            if (currentIndex !== -1) {
              if (currentIndex > 0) prev = feedIds[currentIndex - 1].toString();
              if (currentIndex < feedIds.length - 1) next = feedIds[currentIndex + 1].toString();
            }
          } catch {
            // sessionStorage 파싱 실패 시 무시
          }
        }
      }
    }

    setPrevId(prev);
    setNextId(next);
  }, [currentId, searchParams]);

  const hasPrev = !!prevId;
  const hasNext = !!nextId;

  const handleNavigation = (targetId: string) => {
    // 프로필에서 온 경우 프로필 컨텍스트 유지
    const profileId = searchParams.get('profileId');
    const source = typeof window !== 'undefined' ? sessionStorage.getItem('shorlog_source') : null;

    if (source === 'profile' && profileId) {
      // 프로필에서 온 경우: profileId만 유지하고 prev/next는 새로 계산
      const queryParams = new URLSearchParams();
      queryParams.set('profileId', profileId);

      // sessionStorage에서 피드 정보 가져와서 새로운 prev/next 계산
      if (typeof window !== 'undefined') {
        const feedIdsStr = sessionStorage.getItem('shorlog_feed_ids');
        if (feedIdsStr) {
          try {
            const feedIds: number[] = JSON.parse(feedIdsStr);
            const targetIndex = feedIds.findIndex(id => id === parseInt(targetId));

            if (targetIndex !== -1) {
              if (targetIndex > 0) {
                queryParams.set('prev', feedIds[targetIndex - 1].toString());
              }
              if (targetIndex < feedIds.length - 1) {
                queryParams.set('next', feedIds[targetIndex + 1].toString());
              }
            }
          } catch {
            // sessionStorage 파싱 실패 시 무시
          }
        }
      }

      router.push(`/shorlog/${targetId}?${queryParams.toString()}`);
    } else {
      // 피드에서 온 경우: 기존 방식
      router.push(`/shorlog/${targetId}`);
    }
  };

  return (
    <>
      {hasPrev && (
        <button
          type="button"
          aria-label="이전 숏로그"
          onClick={() => handleNavigation(prevId!)}
          className="
            absolute left-0 top-1/2 z-50 -translate-x-12 -translate-y-1/2
            flex h-12 w-12 items-center justify-center rounded-full
            border-2 border-white bg-white text-2xl text-slate-700
            shadow-xl transition hover:bg-slate-50 hover:scale-110
            md:flex
          "
        >
          ‹
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          aria-label="다음 숏로그"
          onClick={() => handleNavigation(nextId!)}
          className="
            absolute right-0 top-1/2 z-50 translate-x-12 -translate-y-1/2
            flex h-12 w-12 items-center justify-center rounded-full
            border-2 border-white bg-white text-2xl text-slate-700
            shadow-xl transition hover:bg-slate-50 hover:scale-110
            md:flex
          "
        >
          ›
        </button>
      )}
    </>
  );
}

export default function ShorlogDetailPageClient({ detail, isOwner = false, hideNavArrows = false }: Props) {
  const [ttsProgress, setTtsProgress] = useState(0);
  const firstLineForAlt = detail.content.split('\n')[0]?.slice(0, 40) ?? '';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const isModified = detail.modifiedAt && detail.modifiedAt !== detail.createdAt;

  return (
    <div className="relative flex h-full w-full items-stretch">
      {!hideNavArrows && <PrevNextNavArrows currentId={detail.id} />}

      <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-1 items-stretch">
          <ShorlogImageSlider images={detail.thumbnailUrls} alt={firstLineForAlt} />
        </div>

        <aside className="flex h-full flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 md:px-5 md:py-4">
            <ShorlogAuthorHeader
              username={detail.username}
              nickname={detail.nickname}
              profileImgUrl={detail.profileImgUrl}
              isOwner={isOwner}
              shorlogId={detail.id}
              userId={detail.userId}
            />
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-3 md:px-5 md:pb-5 md:pt-4">
            <section aria-label="숏로그 내용">
              <HighlightedContent content={detail.content} progress={ttsProgress} />

              {detail.hashtags && detail.hashtags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <time dateTime={detail.createdAt}>
                  {formatDate(detail.createdAt)}
                </time>
                {isModified && (
                  <>
                    <span>·</span>
                    <span>수정됨</span>
                  </>
                )}
              </div>
            </section>

            <section aria-label="리액션" className="mt-2 border-t border-slate-100 pt-3">
              <ShorlogReactionSection
                likeCount={detail.likeCount}
                commentCount={detail.commentCount}
                bookmarkCount={detail.bookmarkCount}
              />

              {detail.linkedBlogId && (
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={`/blog/${detail.linkedBlogId}`}
                    className="inline-flex items-center rounded-full bg-[#2979FF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1863db] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    블로그 바로가기
                  </a>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => alert('썸네일 수정 기능은 추후 제공될 예정입니다.')}
                      className="inline-flex items-center rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      {/* TODO: 썸네일 수정 모달 구현 */}
                      썸네일 수정하기
                    </button>
                  )}
                </div>
              )}
            </section>

            <section aria-label="TTS 컨트롤" className="mt-4">
              <ShorlogTtsController progress={ttsProgress} setProgress={setTtsProgress} />
            </section>

            <section aria-label="댓글" className="mt-4 border-t border-slate-100 pt-3">
              <ShorlogCommentSection
                shorlogId={detail.id}
              />
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}