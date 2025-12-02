'use client';

import { fetchAiGenerate } from '@/src/api/aiApi';
import ToolTip from '@/src/app/components/ai/Tooltip';
import type {
  AiGenerateContentType,
  AiGenerateMode,
  AiGenerateMultiResults,
  AiGenerateRequest,
  AiGenerateSummaryResult,
} from '@/src/types/ai';
import { Check, Copy, RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import LoadingSpinner from '../../common/LoadingSpinner';

// 전역으로 현재 열린 AiGeneration의 id를 관리
let openPanelStack: string[] = [];

interface AiGenerationProps {
  mode: AiGenerateMode;
  contentType: AiGenerateContentType;
  content?: string;
  onApply: (value: string) => void;
  revealOnHover?: boolean;
}

export default function AiGeneration({
  mode,
  contentType,
  content,
  onApply,
  revealOnHover,
}: AiGenerationProps) {
  // 각 패널 고유 id (랜덤)
  const panelIdRef = useRef<string>(Math.random().toString(36).slice(2));
  const panelId = panelIdRef.current;

  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [promptError, setPromptError] = useState<string | null>(null);

  // 메시지 최대 길이
  const MAX_PROMPT_LENGTH = 1000;

  // 복사 UX
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const typeLabel = contentType === 'blog' ? '블로그' : '숏로그';

  const placeholder = '추가 조건 입력하기';

  const tooltipText = useMemo(() => {
    switch (mode) {
      case 'title':
        return '제목 추천받기';
      case 'keyword':
        return '검색어 추천받기';
      case 'summary':
        return '숏로그 내용 생성하기';
      case 'hashtag':
        return '해시태그 추천받기';
      default:
        return 'AI 추천받기';
    }
  }, [mode]);

  /**
   * 결과 길이에 따른 자동 폭 계산
   * - 결과가 길면 넓어지고
   * - 없으면 기본 폭
   * - 너무 넓어지지 않게 clamp
   */
  const panelWidthPx = useMemo(() => {
    const texts = results.length ? results : [placeholder];
    const maxLen = Math.max(...texts.map((t) => t.length), 10);

    // 대충 "글자 길이 * 9px" 느낌 + padding
    const estimated = maxLen * 9 + 120;
    const minW = 240;
    const maxW = 420;

    return Math.min(Math.max(estimated, minW), maxW);
  }, [results, placeholder]);

  // 바깥 클릭하면 축소 & ESC 키로 닫기 (가장 최근 패널만)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        isExpanded &&
        openPanelStack[openPanelStack.length - 1] === panelId
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [panelId, isExpanded]);

  // 패널이 열릴 때 최신 패널로 등록
  useEffect(() => {
    if (isExpanded) {
      // 이미 있으면 제거하고 맨 뒤로(최신) 보냄
      openPanelStack = openPanelStack.filter((id) => id !== panelId);
      openPanelStack.push(panelId);
    } else {
      // 닫히면 스택에서 제거
      openPanelStack = openPanelStack.filter((id) => id !== panelId);
    }

    // 언마운트될 때도 제거(안전)
    return () => {
      openPanelStack = openPanelStack.filter((id) => id !== panelId);
    };
  }, [isExpanded, panelId]);

  const runGenerate = async () => {
    if (!content || content.trim() === '') {
      setResults([]);
      setErrorMsg(`${typeLabel} 내용을 먼저 채워주세요`);
      setIsExpanded(true);
      return;
    }

    if (prompt.trim().length > MAX_PROMPT_LENGTH) {
      setPromptError(`* 메시지는 ${MAX_PROMPT_LENGTH}자 이내로 입력해 주세요`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setPromptError(null);
    setIsExpanded(true);

    const message = prompt.trim() ? prompt.trim() : undefined;
    const previousResults = message && results.length > 0 ? results : undefined;

    try {
      const req: AiGenerateRequest = {
        mode,
        contentType,
        content,
        message,
        previousResults,
      };

      const res = await fetchAiGenerate(req);

      let nextResults: string[] = [];
      if ('results' in res.data) {
        nextResults = (res.data as AiGenerateMultiResults).results;
      } else if ('result' in res.data) {
        nextResults = [(res.data as AiGenerateSummaryResult).result];
      }

      setResults(nextResults);
      setIsExpanded(true);
    } catch (e) {
      setResults([]);
      setErrorMsg('AI 추천 중 오류가 발생했어요.\n잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    if (results.length > 0 && !errorMsg) {
      setIsExpanded(true);
      return;
    }

    runGenerate();
  };

  const handleSelect = (value: string) => {
    onApply(value);
  };

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch {
      // clipboard 실패는 조용히 무시
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      {/* 추천 버튼 */}
      <div
        className={[
          'relative group inline-flex', // 기존 tooltip group용
          // ✅ revealOnHover일 때: 닫혀있으면 숨김, 부모 hover 시 보임
          revealOnHover
            ? isExpanded
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-90 translate-x-1 pointer-events-none ' +
                'group-hover/ai:opacity-100 group-hover/ai:scale-100 group-hover/ai:translate-x-0 group-hover/ai:pointer-events-auto ' +
                'transition-all duration-200 ease-out group-hover/ai:animate-[pulse_1.5s_ease-in-out_2]'
            : '',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={handleButtonClick}
          onMouseLeave={() => {
            if (errorMsg) setIsExpanded(false);
          }}
          className={[
            'relative group inline-flex',
            // 기본은 동그라미(최소폭만)
            'group inline-flex h-7 items-center rounded-2xl border border-slate-200 bg-white font-medium text-main shadow-sm',
            'transition-all duration-200 ease-out hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]',
            // 폭 자동으로 늘어나게 padding을 기본/hover로 다르게
            isLoading ? 'px-2 cursor-default' : 'pl-2 pr-1 hover:w-auto hover:px-3',
          ].join(' ')}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" inline />
          ) : (
            <>
              <span className="shrink-0">✦</span>

              {/* hover 때만 펼쳐지는 텍스트 */}
              <span
                className={[
                  'text-xs ml-1 overflow-hidden whitespace-nowrap',
                  'max-w-0 opacity-0',
                  'transition-all duration-200 ease-out',
                  'group-hover:max-w-[160px] group-hover:opacity-100',
                ].join(' ')}
              >
                {tooltipText}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 확장 패널 */}
      <div
        style={{ width: panelWidthPx }}
        className={[
          'absolute right-0 top-full z-50 mt-2 origin-top-right rounded-xl border border-slate-200 bg-white shadow',
          'transition-all duration-200 ease-out',
          'will-change-[transform,opacity,width]',
          isExpanded
            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto'
            : 'scale-95 opacity-0 -translate-y-1 pointer-events-none',
        ].join(' ')}
      >
        {/* 헤더 */}
        <div
          className={[
            'flex items-center gap-2 px-3 py-2 mx-1',
            errorMsg ? 'pt-5' : 'border-b border-slate-100',
            promptError ? 'pb-6' : '',
          ].join(' ')}
        >
          {/* <span className="text-slate-700">✦</span> */}

          {errorMsg ? (
            <span className="whitespace-pre-line text-xs font-medium text-rose-500 text-center w-full block">
              {errorMsg}
            </span>
          ) : (
            <>
              {/* 추가 요청 입력창 */}

              <div className="relative flex-1">
                <input
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none pr-6"
                  placeholder={placeholder}
                  value={prompt}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length > MAX_PROMPT_LENGTH) {
                      setPromptError(`* 메시지는 ${MAX_PROMPT_LENGTH}자 이내로 입력해 주세요`);
                      value = value.slice(0, MAX_PROMPT_LENGTH);
                    } else {
                      setPromptError(null);
                    }
                    setPrompt(value);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      prompt.trim() &&
                      prompt.trim().length <= MAX_PROMPT_LENGTH
                    )
                      runGenerate();
                  }}
                />
                {promptError && (
                  <div
                    className="
                        absolute left-1/2 top-full mt-1 -translate-x-1/2
                        max-w-[220px] w-max
                        px-1.5 py-0.5
                        text-xs text-rose-500 text-center
                        whitespace-normal break-words
                        pointer-events-none
                  "
                  >
                    {promptError}
                  </div>
                )}
                <button
                  type="button"
                  className={[
                    'absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-opacity duration-100',
                    prompt ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                  ].join(' ')}
                  onClick={() => setPrompt('')}
                  tabIndex={-1}
                  aria-label="입력 지우기"
                >
                  <X size={14} />
                </button>
              </div>

              {/* 재추천 버튼 */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={runGenerate}
                  disabled={isLoading}
                  className={`
                      rounded-md p-1 text-slate-500 disabled:opacity-50 disabled:cursor-default
                      ${isLoading ? '' : 'hover:bg-slate-100 hover:text-slate-700'}
                  `}
                  aria-label="retry"
                >
                  <RefreshCw size={14} />
                </button>
                {!isLoading && <ToolTip text="재추천" />}
              </div>
            </>
          )}
        </div>

        {/* 결과 리스트 */}
        <div className="max-h-[260px] overflow-auto p-2">
          {isLoading && results.length === 0 && !errorMsg && (
            <div className="px-2 py-6 text-center text-xs text-slate-400">추천 생성 중…</div>
          )}

          {!isLoading && !errorMsg && results.length === 0 && (
            <div className="px-2 py-6 text-center text-xs text-slate-400">추천 결과가 없어요</div>
          )}

          {results.map((r, i) => {
            const copied = copiedIndex === i;

            return (
              <div key={`${r}-${i}`} className="group relative mb-1.5">
                {/* 결과 선택 버튼 */}
                <button
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 pr-9 text-left text-xs text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
                >
                  {r}
                </button>

                {/* 복사 버튼 (클릭 전파 막기) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(r, i);
                  }}
                  className="
                     absolute right-1 top-1/2 -translate-y-1/2
                    rounded-lg border border-slate-200 bg-white p-1.5
                    text-slate-500 opacity-0 transition
                    hover:bg-slate-50 group-hover:opacity-100
                  "
                  aria-label="copy"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
