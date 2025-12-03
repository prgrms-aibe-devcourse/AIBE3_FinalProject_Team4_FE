'use client';

import { useRequireAuth } from '@/src/hooks/userRequireAuth';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useEffect, useState } from 'react';

interface Props {
  progress: number; // 0 ~ 1
  setProgress: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * 실제 오디오 없이, 진행률을 타이머 기반으로 증가시키는 "대략적인" TTS UI.
 * 추가로 10초 전/후(여기서는 전체의 10% 단위)와 다운로드 버튼을 제공한다.
 */
export default function ShorlogTtsController({ progress, setProgress }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const requireAuth = useRequireAuth();
  // 재생 중일 때 진행률 증가
  useEffect(() => {
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 0.01, 1); // 0.01씩 증가 (대략)
        if (next >= 1) {
          setIsPlaying(false);
        }
        return next;
      });
    }, 250);

    return () => window.clearInterval(interval);
  }, [isPlaying, setProgress]);

  const handleTogglePlay = () => {
    // 로그인 체크
    if (!requireAuth()) {
      showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      showGlobalToast('TTS를 일시정지했습니다.', 'success');
      return;
    }
    if (progress >= 1) {
      setProgress(0);
    }
    setIsPlaying(true);
    showGlobalToast('TTS를 재생합니다.', 'success');
  };

  // 10초 전/후 → 실제 오디오가 없으니 "전체의 10%" 기준으로 이동
  const skipBy = (delta: number) => {
    // 로그인 체크
    if (!requireAuth()) {
      showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
      return;
    }
    setProgress((prev) => Math.max(0, Math.min(prev + delta, 1)));
  };

  const handleDownload = () => {
    // 로그인 체크
    if (!requireAuth()) {
      showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
      return;
    }
    // 실제 TTS 파일 다운로드는 추후 백엔드 연동 시 구현
    showGlobalToast('TTS 음성 다운로드 기능은 추후 제공될 예정입니다.', 'warning');
  };

  const percentage = Math.round(progress * 100);

  // 가상 총 재생 시간 (초 단위) - 실제 TTS 연동 시 실제 duration으로 대체
  const totalDuration = 120; // 2분 (예시)
  const currentTime = Math.floor(totalDuration * progress);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      {/* 헤더: 라벨 + 진행률 */}
      <div className="flex items-center justify-between text-[13px] text-slate-600">
        <span className="font-semibold">TTS</span>
        <span className="text-[11px] text-slate-400">진행률 {percentage}%</span>
      </div>

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
            className="flex flex-col items-center text-[11px] text-slate-500 hover:text-slate-800"
          >
            <span className="text-[10px] leading-none mb-[2px]">10</span>
            <span className="text-base leading-none">⟲</span>
          </button>

          {/* 재생/일시정지 */}
          <button
            type="button"
            aria-label={isPlaying ? 'TTS 일시정지' : 'TTS 재생'}
            onClick={handleTogglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          {/* 10초 후 */}
          <button
            type="button"
            aria-label="10초 후로 이동"
            onClick={() => skipBy(0.1)}
            className="flex flex-col items-center text-[11px] text-slate-500 hover:text-slate-800"
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
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base text-slate-600 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          ⬇
        </button>
      </div>

      {/* 진행 바 + 시간 표시 */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
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
function isAuthenticated() {
  throw new Error('Function not implemented.');
}
