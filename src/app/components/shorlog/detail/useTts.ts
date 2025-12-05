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
      // 기존 TTS URL이 있으면 사용
      if (ttsUrl) {
        audioPlayer.play(ttsUrl);
        setMode('ai');
        return;
      }

      // TTS 생성
      const url = await TtsService.generateTts(shorlogId);
      if (url) {
        setTtsUrl(url);
        audioPlayer.play(url);
        setMode('ai');
        await fetchTokens(); // 토큰 업데이트
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS 생성에 실패했습니다.');
      playWebSpeech(); // 실패 시 Web Speech로 전환
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
    if (mode === 'ai') {
      audioPlayer.resume();
    } else if (mode === 'web') {
      webSpeech.resume();
    } else {
      playAiTts(); // 처음 재생 시 AI TTS 시도
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
      await fetchTokens();
      const url = await TtsService.getTtsUrl(shorlogId);
      if (url) setTtsUrl(url);
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

