'use client';

import { showGlobalToast } from '@/src/lib/toastStore';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  authorName?: string;
  thumbnailUrl?: string | null;
  url?: string;
};

export function ShareModal({
  open,
  onClose,
  title,
  description,
  authorName,
  thumbnailUrl,
  url,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState(url ?? '');

  /** URL 설정 */
  useEffect(() => {
    if (!url && typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    } else if (url) {
      setShareUrl(url);
    }
  }, [url]);

  /** Kakao SDK 초기화 */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.Kakao) return;

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_APP_KEY);
    }
  }, []);

  if (!open) return null;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  /** 링크 복사 */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showGlobalToast('링크가 복사되었습니다.', 'success');
    } catch {
      alert('복사에 실패했습니다. 수동으로 복사해 주세요.');
    }
  };

  /** popup helper */
  const openPopup = (shareLink: string) => {
    window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  /** 웹 공유 API */
  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch {}
    } else {
      alert('이 브라우저에서는 시스템 공유를 지원하지 않습니다.');
    }
  };

  /** 카카오톡 공유 기능*/
  const handleShareKakao = () => {
    if (!shareUrl) return;

    if (typeof window !== 'undefined' && window.Kakao?.isInitialized()) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title,
            description: description || '',
            imageUrl: thumbnailUrl ?? 'https://via.placeholder.com/400x300?text=TexTok',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: '블로그 보기',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
          ],
        });
      } catch (err) {
        console.error(err);
        showGlobalToast('카카오 공유 중 오류가 발생했습니다.', 'error');
      }
    } else {
      const fallback = confirm('카카오 공유가 설정되지 않았습니다.\n대신 링크를 복사할까요?');
      if (fallback) handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[520px] rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-base font-semibold text-slate-900">블로그 공유</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* 미리보기 카드 */}
        <div className="px-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-200">
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt="썸네일"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  썸네일 없음
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
              {description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{description}</p>
              )}
              {authorName && <p className="mt-0.5 text-[11px] text-slate-400">by {authorName}</p>}
            </div>
          </div>
        </div>

        {/* 링크 복사 */}
        <div className="px-6 pt-4">
          <label className="mb-1 block text-xs font-medium text-slate-500">공유 링크</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="flex-1 truncate text-xs text-slate-600">{shareUrl}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center rounded-lg bg-[#2979FF] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1f5ecc]"
            >
              복사
            </button>
          </div>
        </div>

        {/* SNS 공유 버튼 */}
        <div className="px-6 pt-5 pb-3">
          <p className="mb-3 text-xs font-semibold text-slate-500">SNS로 공유하기</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {/* 카카오톡 공유 추가됨 */}
            <button
              type="button"
              onClick={handleShareKakao}
              className="flex items-center justify-center rounded-xl bg-[#FEE500] py-2 text-slate-900 hover:brightness-95"
            >
              카카오톡
            </button>

            <button
              type="button"
              onClick={() =>
                openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)
              }
              className="flex items-center justify-center rounded-xl bg-[#1877F2] py-2 text-white hover:brightness-110"
            >
              페이스북
            </button>

            <button
              type="button"
              onClick={() =>
                openPopup(`https://band.us/plugin/share?body=${encodedTitle}%0A${encodedUrl}`)
              }
              className="flex items-center justify-center rounded-xl bg-[#1EC800] py-2 text-white hover:brightness-110"
            >
              네이버 밴드
            </button>

            <button
              type="button"
              onClick={() =>
                openPopup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)
              }
              className="flex items-center justify-center rounded-xl bg-[#0A66C2] py-2 text-white hover:brightness-110"
            >
              링크드인
            </button>
          </div>
        </div>

        {/* 이메일 / 시스템 공유 */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <a
              href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
            >
              이메일로 공유
            </a>
            <button
              type="button"
              onClick={handleWebShare}
              className="inline-flex items-center rounded-full bg-[#2979FF] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#1f5ecc]"
            >
              기기 공유 시트 열기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Kakao 타입
declare global {
  interface Window {
    Kakao: any;
  }
}
