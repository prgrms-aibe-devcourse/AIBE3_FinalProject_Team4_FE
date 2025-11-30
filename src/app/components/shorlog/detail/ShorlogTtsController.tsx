'use client';

import { useEffect } from 'react';
import { useTts } from './useTts';

interface Props {
  shorlogId: number;
  content: string;
  progress: number; // 호환성을 위해 유지
  setProgress: React.Dispatch<React.SetStateAction<number>>; // 호환성을 위해 유지
}

// 기존 스타일을 유지하면서 토큰 표시만 추가한 TTS 컨트롤러
export default function ShorlogTtsController({ shorlogId, content, progress, setProgress }: Props) {
  const {
    tokens,
    mode,
    isLoading,
    isPlaying: ttsIsPlaying,
    progress: ttsProgress,
    duration,
    currentTime,
    error,
    togglePlay,
    skip,
    download
  } = useTts({ shorlogId, content });

  // useTts의 진행률을 부모 컴포넌트와 동기화
  useEffect(() => {
    if (ttsProgress !== progress) {
      setProgress(ttsProgress);
    }
  }, [ttsProgress, progress, setProgress]);

  const handleTogglePlay = () => {
    togglePlay();
  };

  // 10초 전/후 이동 (실제 TTS 기능 사용)
  const skipBy = (seconds: number) => {
    skip(seconds === -0.1 ? -10 : 10); // 기존 UI의 -0.1, 0.1을 10초로 변환
  };

  const handleDownload = () => {
    download();
  };

  const percentage = Math.round(progress * 100);

  // 실제 TTS duration과 currentTime 사용
  const totalDurationSeconds = Math.floor((duration || 0) / 1000);
  const currentTimeSeconds = Math.floor((currentTime || 0) / 1000);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      {/* 헤더: 라벨 + 토큰 표시 */}
      <div className="flex items-center justify-between text-[13px] text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold">🔊 TTS</span>
          {tokens && (
            <span className="text-[12px] text-slate-500">
              토큰: {tokens.token}/100
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400">진행률 {percentage}%</span>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-2 text-[12px] text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}

      {/* 토큰 소진 안내 */}
      {tokens && tokens.token <= 0 && mode === 'web' && (
        <div className="mt-2 text-[12px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
          TTS 토큰이 부족하여 기본 음성으로 재생됩니다.
        </div>
      )}

      {/* 컨트롤 영역 */}
      <div className="mt-2 flex items-center justify-between">
        {/* 왼쪽 여백 (다운로드 버튼과 균형 맞추기) */}
        <div className="w-8"></div>

        {/* 중앙 재생 컨트롤 */}
        <div className="flex items-center gap-3">
          {/* 10초 전 */}
          <button
            type="button"
            aria-label="10초 전으로 이동"
            onClick={() => skipBy(-0.1)}
            disabled={mode === 'web'}
            className="flex flex-col items-center text-[11px] text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-[10px] leading-none mb-[2px]">10</span>
            <span className="text-base leading-none">⟲</span>
          </button>

          {/* 재생/일시정지 */}
          <button
            type="button"
            aria-label={ttsIsPlaying ? 'TTS 일시정지' : 'TTS 재생'}
            onClick={handleTogglePlay}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:opacity-50"
          >
            {isLoading ? '⟳' : (ttsIsPlaying ? '❚❚' : '▶')}
          </button>

          {/* 10초 후 */}
          <button
            type="button"
            aria-label="10초 후로 이동"
            onClick={() => skipBy(0.1)}
            disabled={mode === 'web'}
            className="flex flex-col items-center text-[11px] text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-[10px] leading-none mb-[2px]">10</span>
            <span className="text-base leading-none">⟳</span>
          </button>
        </div>

        {/* 오른쪽 다운로드 버튼 */}
        <button
          type="button"
          aria-label="TTS 다운로드"
          onClick={handleDownload}
          disabled={mode !== 'ai' || isLoading}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base text-slate-600 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? '⟳' : '⬇'}
        </button>
      </div>

      {/* 진행 바 + 시간 표시 */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatTime(currentTimeSeconds)}</span>
          <span>{totalDurationSeconds > 0 ? formatTime(totalDurationSeconds) : '--:--'}</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-slate-200">
          <div
            className="h-1.5 rounded-full bg-[#2979FF] transition-[width]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
