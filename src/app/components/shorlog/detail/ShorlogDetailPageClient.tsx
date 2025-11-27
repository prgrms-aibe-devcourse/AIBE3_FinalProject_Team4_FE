'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ShorlogImageSlider from './ShorlogImageSlider';
import ShorlogAuthorHeader from './ShorlogAuthorHeader';
import ShorlogTtsController from './ShorlogTtsController';
import ShorlogCommentSection from './ShorlogCommentSection';
import ShorlogReactionSection from './ShorlogReactionSection';
import type { ShorlogDetail } from './types';

interface Props {
  detail: ShorlogDetail;
  isOwner?: boolean;
}

function formatKoreanDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// TTS 진행률에 따른 텍스트 하이라이트
function HighlightedContent({ content, progress }: { content: string; progress: number }) {
  const totalLength = content.length;
  if (totalLength === 0) {
    return (
      <p className="text-sm leading-relaxed text-slate-400">
        아직 내용이 없습니다.
      </p>
    );
  }

  const clamped = Math.max(0, Math.min(progress, 1));
  const highlightLength = Math.floor(totalLength * clamped);

  if (highlightLength <= 0) {
    return (
      <p className="whitespace-pre-line text-[15px] md:text-base leading-relaxed text-slate-900">
        {content}
      </p>
    );
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

// 좌/우 숏로그 이동 화살표 (URL 쿼리 파라미터 기반)
function PrevNextNavArrows({ currentId }: { currentId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);

  // 마운트 시 또는 currentId 변경 시 prev/next ID 계산
  useEffect(() => {
    // URL 쿼리 파라미터에서 먼저 확인
    let prev = searchParams.get('prev');
    let next = searchParams.get('next');

    // 쿼리 파라미터가 없으면 세션 스토리지에서 피드 리스트를 가져와서 계산
    if (!prev || !next) {
      if (typeof window !== 'undefined') {
        const feedIdsStr = sessionStorage.getItem('shorlog_feed_ids');
        if (feedIdsStr) {
          try {
            const feedIds: number[] = JSON.parse(feedIdsStr);
            const currentIndex = feedIds.findIndex(id => id === currentId);

            if (currentIndex !== -1) {
              if (currentIndex > 0) {
                prev = feedIds[currentIndex - 1].toString();
              }
              if (currentIndex < feedIds.length - 1) {
                next = feedIds[currentIndex + 1].toString();
              }
            }
          } catch (e) {
            // sessionStorage 파싱 실패 시 조용히 무시
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
    router.push(`/shorlog/${targetId}`);
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

export default function ShorlogDetailPageClient({ detail, isOwner = false }: Props) {
  const created = formatKoreanDate(detail.createdAt);
  const modified = formatKoreanDate(detail.modifiedAt);
  const isModified = detail.modifiedAt && detail.modifiedAt !== detail.createdAt;

  const [ttsProgress, setTtsProgress] = useState(0);
  const firstLineForAlt = detail.content.split('\n')[0]?.slice(0, 40) ?? '';

  return (
    <div className="relative flex h-full w-full items-stretch">
      <PrevNextNavArrows currentId={detail.id} />

      <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        {/* 왼쪽 이미지 – 50% */}
        <div className="flex flex-1 items-stretch">
          <ShorlogImageSlider images={detail.thumbnailUrls} alt={firstLineForAlt} />
        </div>

        {/* 오른쪽 콘텐츠 – 50% */}
        <aside className="flex h-full flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 md:px-5 md:py-4">
            <ShorlogAuthorHeader
              username={detail.username}
              nickname={detail.nickname}
              profileImgUrl={detail.profileImgUrl}
              isOwner={isOwner}
            />
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-3 md:px-5 md:pb-5 md:pt-4">
            <section aria-label="숏로그 내용">
              <HighlightedContent content={detail.content} progress={ttsProgress} />
              {/* 해시태그, 작성일/수정일 ... */}
            </section>

            {/* 리액션 + 블로그 / 썸네일 버튼 */}
            <section aria-label="리액션" className="mt-4 border-t border-slate-100 pt-3">
              <ShorlogReactionSection
                likeCount={detail.likeCount}
                commentCount={detail.commentCount}
                bookmarkCount={detail.bookmarkCount}
              />

              {detail.linkedBlogId && (
                <div className="mt-3 flex items-center gap-2">
                  {/* 블로그 바로가기 버튼 */}
                  <a
                    href={`/blog/${detail.linkedBlogId}`}
                    className="inline-flex items-center rounded-full bg-[#2979FF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1863db] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    블로그 바로가기
                  </a>

                  {/* 썸네일 수정하기 – 소유자만 */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        // TODO: 썸네일 수정 모달 열기
                        alert('썸네일 수정 기능은 추후 제공될 예정입니다.');
                      }}
                      className="inline-flex items-center rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
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
                initialCommentCount={detail.commentCount}
              />
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}