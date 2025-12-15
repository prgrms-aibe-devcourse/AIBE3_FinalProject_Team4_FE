'use client';

import { useState, useEffect, useRef } from 'react';
import { TtsTokenResponse } from '@/src/api/ttsApi';
import { TtsAudioPlayer, TtsWebSpeech, TtsFileDownloader } from './ttsUtils';
import { TtsService, TtsMode } from './ttsService';

interface UseTtsProps {
  shorlogId: number;
  content: string;
}

export function useTts({ shorlogId, content }: UseTtsProps) {
  const [tokens, setTokens] = useState<TtsTokenResponse | null>(null);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);const [mode, setMode] = useState<TtsMode>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const webSpeech = new TtsWebSpeech(speechRef, {
    onStart: () => {
      setIsPlaying(true);
      setMode('web');
      setProgress(0);
      setCurrentTime(0);
    },
    onEnd: () => {
      setIsPlaying(false);
      setProgress(1);
    },
    onError: (error) => {
      setIsPlaying(false);
      setError(error);
    },
    onProgress: (prog, currentTimeMs, durationMs) => {
      setProgress(prog);
      setCurrentTime(currentTimeMs);
      setDuration(durationMs);
    },
    onPause: () => {
      setIsPlaying(false);
    },
    onResume: () => {
      setIsPlaying(true);
    }
  });

  const fetchTokens = async () => {
    const tokenData = await TtsService.fetchTokens();
    setTokens(tokenData);
  };


  const playAiTts = async () => {
    if (ttsUrl) {
      console.log('[TTS] 저장된 TTS 재생:', ttsUrl);
      audioPlayer.play(ttsUrl);
      setMode('ai');
      return;
    }

    // 토큰이 없으면 Web Speech 사용
    if (!TtsService.hasValidTokens(tokens)) {
      console.log('[TTS] 토큰 부족, Web Speech 사용');
      playWebSpeech();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[TTS] TTS 생성 API 호출');
      const response = await TtsService.generateTts(shorlogId);

      if (response && response.ttsUrl) {
        console.log('[TTS] TTS 성공 - URL:', response.ttsUrl, '남은 토큰:', response.remainingToken);
        setTtsUrl(response.ttsUrl);

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
      console.error('[TTS] 에러:', errorMessage);
      setError(errorMessage);
      playWebSpeech();
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API로 재생
  const playWebSpeech = () => {
    try {
      if (!('speechSynthesis' in window)) {
        setError('브라우저에서 음성 재생을 지원하지 않습니다.');
        return;
      }

      if (!content || content.trim().length === 0) {
        setError('재생할 내용이 없습니다.');
        return;
      }

      setError(null); // 기존 에러 초기화
      const { estimatedDuration } = webSpeech.speak(content);
      setDuration(estimatedDuration);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '음성 재생 초기화에 실패했습니다.';
      setError(errorMessage);
    }
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
    if (ttsUrl) {
      console.log('[TTS] 저장된 TTS 재생');
      audioPlayer.play(ttsUrl);
      setMode('ai');
      return;
    }

    if (mode === 'web') {
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

  const cleanup = () => {
    audioPlayer.cleanup();
    webSpeech.cancel();

    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setMode('none');
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
      cleanup();

      setTtsUrl(null);
      setError(null);

      // 토큰 조회
      const tokenData = await TtsService.fetchTokens();
      if (tokenData) {
        setTokens(tokenData);
        console.log('[TTS] 토큰 조회 완료 - 남은 토큰:', tokenData.token);
      }
    };

    initialize();
  }, [shorlogId]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanup();
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
    cleanup,
  };
}