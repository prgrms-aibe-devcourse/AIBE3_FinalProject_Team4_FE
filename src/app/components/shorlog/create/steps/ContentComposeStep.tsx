'use client';

import { MAX_CONTENT_LENGTH } from '../types';
import ShorlogImageSlider from '../../detail/ShorlogImageSlider';
import LoadingSpinner from '../../../common/LoadingSpinner';

interface ContentComposeStepProps {
  images: string[];
  content: string;
  setContent: (value: string) => void;
  hashtags: string[];
  hashtagInput: string;
  setHashtagInput: (value: string) => void;
  onHashtagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  addHashtagFromInput: () => void;
  removeHashtag: (tag: string) => void;
  onAiHashtagClick: () => void;
  isAiLoading: boolean;
  onBlogToShorlogClick?: () => void;
  isBlogConverting?: boolean;
  onPrev: () => void;
  onSaveDraft?: () => void; // 수정 모드에서는 선택적
  onSubmit: () => void;
  isSubmitting: boolean;
  // 수정 모드용 props (선택적)
  isEditMode?: boolean;
  linkedBlogId?: number | null;
  linkedBlogTitle?: string;
  onDisconnectBlog?: () => void;
  onConnectBlog?: () => void;
}

export default function ContentComposeStep({
                                             images,
                                             content,
                                             setContent,
                                             hashtags,
                                             hashtagInput,
                                             setHashtagInput,
                                             onHashtagKeyDown,
                                             addHashtagFromInput,
                                             removeHashtag,
                                             onAiHashtagClick,
                                             isAiLoading,
                                             onBlogToShorlogClick,
                                             isBlogConverting = false,
                                             onPrev,
                                             onSaveDraft,
                                             onSubmit,
                                             isSubmitting,
                                             isEditMode = false,
                                             linkedBlogId,
                                             linkedBlogTitle,
                                             onDisconnectBlog,
                                             onConnectBlog,
                                           }: ContentComposeStepProps) {
  const length = content.length;
  const isNearLimit = length > MAX_CONTENT_LENGTH - 40;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > MAX_CONTENT_LENGTH) {
      setContent(value.slice(0, MAX_CONTENT_LENGTH));
    } else {
      setContent(value);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row">
      <section className="flex-1 rounded-2xl bg-slate-50/80 p-3 md:p-4">
        <ShorlogImageSlider images={images} alt="숏로그 이미지 미리보기" />
      </section>

      <section className="flex w-full flex-col gap-3 md:w-[360px]">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            내용
          </label>
          <div className="relative">
            <textarea
              value={content}
              onChange={handleChange}
              rows={11}
              placeholder="숏로그 내용을 입력하세요. 피드에서는 첫 문단이 강조되어 보여요."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition focus:border-[#2979FF] focus:bg-white focus:ring-2 focus:ring-[#2979FF]/20"
            />
            <div className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-slate-400">
              {length}/{MAX_CONTENT_LENGTH}
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            최대 {MAX_CONTENT_LENGTH}자까지 작성할 수 있어요.
          </p>
          {isNearLimit && (
            <p className="mt-1 text-[11px] text-amber-600">
              곧 최대 길이에 도달해요. 핵심만 남기는 걸 추천해요.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            해시태그
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-full border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-900 shadow-inner shadow-slate-100 focus-within:border-[#2979FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2979FF]/20">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={onHashtagKeyDown}
                placeholder="#태그를 입력 후 엔터"
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={addHashtagFromInput}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
            >
              추가
            </button>
          </div>

          {hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hashtags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeHashtag(tag)}
                  className="group flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700 transition hover:bg-slate-200"
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-700">
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onAiHashtagClick}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
            >
              {isAiLoading && <LoadingSpinner size="sm" inline />}
              <span>{isAiLoading ? 'AI 추천 중...' : 'AI 해시태그 추천'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              {hashtags.length}/10
            </span>
          </div>

          {onBlogToShorlogClick && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onBlogToShorlogClick}
                disabled={isBlogConverting}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#2979FF]/20 bg-[#2979FF]/5 px-4 py-2.5 text-xs font-medium text-[#2979FF] shadow-sm hover:bg-[#2979FF]/10 disabled:cursor-not-allowed disabled:text-slate-400 disabled:border-slate-200 disabled:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
              >
                {isBlogConverting && <LoadingSpinner size="sm" inline theme="default" />}
                <span>{isBlogConverting ? '블로그 요약 중...' : '📝 블로그 → 숏로그 변환'}</span>
              </button>
              <p className="mt-1.5 text-center text-[10px] text-slate-400">
                연결된 블로그 내용을 AI로 요약하여 숏로그로 변환해요
              </p>
            </div>
          )}
        </div>

        {/* 블로그 연결 관리 (수정 모드) */}
        {isEditMode && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              블로그 연결
            </label>
            {linkedBlogId ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-700">
                      {linkedBlogTitle || `블로그 #${linkedBlogId}`}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      현재 연결된 블로그
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onDisconnectBlog}
                    className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-[10px] font-medium text-red-600 shadow-sm hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    연결 해제
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onConnectBlog}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50/40 px-3 py-3 text-xs font-medium text-slate-600 hover:border-[#2979FF] hover:bg-[#2979FF]/5 hover:text-[#2979FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
              >
                + 블로그 추가 연결
              </button>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            이전
          </button>
          <div className="flex items-center gap-2">
            {!isEditMode && onSaveDraft && (
              <button
                type="button"
                onClick={onSaveDraft}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
              >
                임시 저장
              </button>
            )}
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="rounded-full bg-[#2979FF] px-5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#1f63d1] disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" inline theme="light" />
                  <span>{isEditMode ? '수정 중...' : '작성 중...'}</span>
                </span>
              ) : (
                isEditMode ? '수정 완료' : '작성 완료'
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
