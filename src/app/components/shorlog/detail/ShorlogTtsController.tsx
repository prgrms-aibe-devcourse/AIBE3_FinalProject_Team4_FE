'use client';

import { useEffect } from 'react';
import { useTts } from './useTts';

interface Props {
  shorlogId: number;
  content: string;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setTtsMode?: (mode: 'none' | 'ai' | 'web') => void;
}

// 기존 스타일을 유지하면서 토큰 표시만 추가한 TTS 컨트롤러
export default function ShorlogTtsController({ shorlogId, content, progress, setProgress, setTtsMode }: Props) {
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
    download,
  } = useTts({ shorlogId, content });

  useEffect(() => {
    if (ttsProgress !== progress) {
      setProgress(ttsProgress);
    }
  }, [ttsProgress, progress, setProgress]);

  useEffect(() => {
    if (setTtsMode) {
      setTtsMode(mode);
    }
  }, [mode, setTtsMode]);

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
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      {/* 상단: 헤더와 메시지를 한 줄로 압축 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="font-semibold text-slate-700">🔊 TTS</span>
          {tokens && <span className="text-slate-500">{tokens.token}/100</span>}
          {/* 모드 표시 */}
          {mode === 'ai' && (
            <span className="px-2 py-1 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
              AI
            </span>
          )}
          {mode === 'web' && (
            <span className="px-2 py-1 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
              기본
            </span>
          )}
          {/* 로딩/에러 상태 */}
          {isLoading && mode !== 'web' && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-blue-300 border-t-blue-700 rounded-full animate-spin"></div>
              <span className="text-[11px] text-blue-700">생성중</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <span>{formatTime(currentTimeSeconds)}</span>
          <span>/</span>
          <span>{totalDurationSeconds > 0 ? formatTime(totalDurationSeconds) : '--:--'}</span>
        </div>
      </div>

      {/* 에러/경고 메시지 (컴팩트) */}
      {error && (
        <div className="mt-2 text-[11px] text-red-600 bg-red-50 px-2 py-1 rounded">{error}</div>
      )}
      {tokens && tokens.token <= 0 && mode === 'web' && (
        <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
          토큰 부족 - 기본 음성 사용
        </div>
      )}

      {/* 컨트롤과 진행바를 한 줄로 배치 */}
      <div className="mt-3 flex items-center gap-3">
        {/* 10초 전 */}
        <button
          type="button"
          aria-label="10초 전으로 이동"
          onClick={() => skipBy(-0.1)}
          disabled={mode === 'web'}
          className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-[12px]">⟲</span>
        </button>

        {/* 재생/일시정지 */}
        <button
          type="button"
          aria-label={ttsIsPlaying ? 'TTS 일시정지' : 'TTS 재생'}
          onClick={handleTogglePlay}
          disabled={isLoading}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:opacity-50 flex-shrink-0"
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="text-[12px]">{ttsIsPlaying ? '❚❚' : '▶'}</span>
          )}
        </button>

        {/* 10초 후 */}
        <button
          type="button"
          aria-label="10초 후로 이동"
          onClick={() => skipBy(0.1)}
          disabled={mode === 'web'}
          className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-[12px]">⟳</span>
        </button>

        {/* 진행 바 (중앙 확장) */}
        <div className="flex-1 mx-3">
          <div className="h-1.5 rounded-full bg-slate-200">
            <div
              className="h-1.5 rounded-full bg-[#2979FF] transition-[width]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* 다운로드 버튼 */}
        <button
          type="button"
          aria-label="TTS 다운로드"
          onClick={handleDownload}
          disabled={mode !== 'ai' || isLoading}
          className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-[12px]">{isLoading ? '⟳' : '⬇'}</span>
        </button>
      </div>
    </div>
  );
}
