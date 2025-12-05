'use client';

import { useState, useEffect, useRef } from 'react';
import { TtsTokenResponse } from '@/src/api/ttsApi';
import { TtsAudioPlayer, TtsWebSpeech, TtsFileDownloader } from './ttsUtils';
import { TtsService, TtsMode } from './ttsService';

interface UseTtsProps {
  shorlogId: number;
  content: string;
}

// TTS 기능을 관리하는 커스텀 훅
export function useTts({ shorlogId, content }: UseTtsProps) {
  const [tokens, setTokens] = useState<TtsTokenResponse | null>(null);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);
  const [cachedUserId, setCachedUserId] = useState<number | null>(null); // 캐시된 사용자 ID
  const [cachedShorlogId, setCachedShorlogId] = useState<number | null>(null); // 캐시된 숏로그 ID
  const [mode, setMode] = useState<TtsMode>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 오디오 플레이어 초기화
  const audioPlayer = new TtsAudioPlayer(audioRef, {
    onLoadedMetadata: (duration) => setDuration(duration),
    onTimeUpdate: (current, prog) => {
      setCurrentTime(current);
      setProgress(prog);
    },
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnded: () => {
      setIsPlaying(false);
      setProgress(1);
    },
    onError: (error) => setError(error)
  });

  // Web Speech 플레이어 초기화
  const webSpeech = new TtsWebSpeech(speechRef, {
    onStart: () => {
      setIsPlaying(true);
      setMode('web');
      setProgress(0);
    },
    onEnd: () => {
      setIsPlaying(false);
      setProgress(1);
    },
    onError: (error) => {
      setIsPlaying(false);
      setError(error);
    },
    onProgress: (prog) => setProgress(prog)
  });

  // 토큰 조회
  const fetchTokens = async () => {
    const tokenData = await TtsService.fetchTokens();
    setTokens(tokenData);
  };

  // AI TTS 생성 및 재생
  const playAiTts = async () => {
    if (!TtsService.hasValidTokens(tokens)) {
      playWebSpeech();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 현재 사용자 ID 확인
      const { fetchMe } = await import('@/src/api/user');
      const currentUser = await fetchMe().catch(() => null);
      const currentUserId = currentUser?.id || null;

      // 캐시 유효성 검증
      const isCacheValid =
        ttsUrl &&
        currentUserId === cachedUserId &&
        shorlogId === cachedShorlogId;

      if (!isCacheValid && ttsUrl) {
        setTtsUrl(null);
      }

      // 캐시가 유효하면 기존 것 재생
      if (isCacheValid && ttsUrl) {
        audioPlayer.play(ttsUrl);
        setMode('ai');
        setIsLoading(false);
        return;
      }

      // 먼저 기존 TTS URL 조회 시도
      let response = await TtsService.getTtsUrl(shorlogId);

      // 기존 TTS가 없으면 새로 생성
      if (!response || !response.ttsUrl) {
        response = await TtsService.generateTts(shorlogId);
      }

      if (response && response.ttsUrl) {
        setTtsUrl(response.ttsUrl);
        setCachedUserId(currentUserId);
        setCachedShorlogId(shorlogId);
        audioPlayer.play(response.ttsUrl);
        setMode('ai');

        // 토큰 업데이트
        setTokens({
          token: response.remainingToken,
          resetDate: tokens?.resetDate || new Date().toISOString()
        });
      } else {
        // TTS URL이 없으면 Web Speech 사용
        playWebSpeech();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'TTS 생성에 실패했습니다.';
      console.error('TTS 에러:', errorMessage);
      setError(errorMessage);
      playWebSpeech();
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API로 재생
  const playWebSpeech = () => {
    const { estimatedDuration } = webSpeech.speak(content);
    setDuration(estimatedDuration);
  };

  // 재생/일시정지 토글
  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // 재생 시작
  const play = () => {
    if (mode === 'ai' && ttsUrl) {
      audioPlayer.resume();
    } else if (mode === 'web') {
      webSpeech.resume();
    } else {
      playAiTts();
    }
  };

  // 일시정지
  const pause = () => {
    if (mode === 'ai') {
      audioPlayer.pause();
    } else if (mode === 'web') {
      webSpeech.pause();
    }
  };

  // 정지
  const stop = () => {
    if (mode === 'ai') {
      audioPlayer.stop();
    } else if (mode === 'web') {
      webSpeech.cancel();
    }

    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  // 특정 위치로 이동
  const seekTo = (position: number) => {
    if (mode === 'ai') {
      audioPlayer.seekTo(position);
    }
    // Web Speech는 seek 지원하지 않음
  };

  // 10초 앞/뒤로 이동
  const skip = (seconds: number) => {
    if (mode === 'ai') {
      audioPlayer.skip(seconds);
    }
    // Web Speech는 skip 지원하지 않음
  };

  // 다운로드
  const download = async () => {
    if (mode !== 'ai' || !ttsUrl) {
      return;
    }

    try {
      setIsLoading(true);
      await TtsFileDownloader.downloadFile(ttsUrl, `shorlog_${shorlogId}_tts.mp3`);
    } catch (error) {
      setError('파일 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 초기화
  useEffect(() => {
    const initialize = async () => {
      // shorlogId 변경 시 상태 초기화
      setTtsUrl(null);
      setCachedShorlogId(null);
      setMode('none');
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setError(null);

      const { fetchMe } = await import('@/src/api/user');
      const currentUser = await fetchMe().catch(() => null);
      const currentUserId = currentUser?.id || null;
      setCachedUserId(currentUserId);

      // 토큰 조회만 수행
      const tokenData = await TtsService.fetchTokens();
      if (tokenData) {
        setTokens(tokenData);
      }
    };

    initialize();
  }, [shorlogId]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      audioPlayer.stop();
      webSpeech.cancel();
    };
  }, []);

  return {
    // 상태
    tokens,
    mode,
    isLoading,
    isPlaying,
    progress,
    duration,
    currentTime,
    error,

    // 액션
    togglePlay,
    play,
    pause,
    stop,
    seekTo,
    skip,
    download,
    fetchTokens,
  };
}