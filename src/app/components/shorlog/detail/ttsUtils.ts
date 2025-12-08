'use client';

// TTS 오디오 재생 관련 유틸리티 함수들
export class TtsAudioPlayer {
  private audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  private onLoadedMetadata?: (duration: number) => void;
  private onTimeUpdate?: (currentTime: number, progress: number) => void;
  private onPlay?: () => void;
  private onPause?: () => void;
  private onEnded?: () => void;
  private onError?: (error: string) => void;

  constructor(
    audioRef: React.MutableRefObject<HTMLAudioElement | null>,
    callbacks: {
      onLoadedMetadata?: (duration: number) => void;
      onTimeUpdate?: (currentTime: number, progress: number) => void;
      onPlay?: () => void;
      onPause?: () => void;
      onEnded?: () => void;
      onError?: (error: string) => void;
    } = {}
  ) {
    this.audioRef = audioRef;
    this.onLoadedMetadata = callbacks.onLoadedMetadata;
    this.onTimeUpdate = callbacks.onTimeUpdate;
    this.onPlay = callbacks.onPlay;
    this.onPause = callbacks.onPause;
    this.onEnded = callbacks.onEnded;
    this.onError = callbacks.onError;
  }

  // 오디오 파일 재생
  play(url: string) {
    // 기존 오디오가 있으면 완전히 정리
    this.cleanup();

    const audio = new Audio(url);
    this.audioRef.current = audio;

    audio.onloadedmetadata = () => {
      this.onLoadedMetadata?.(audio.duration * 1000);
    };

    audio.ontimeupdate = () => {
      const current = audio.currentTime * 1000;
      const progress = current / (audio.duration * 1000);
      this.onTimeUpdate?.(current, progress);
    };

    audio.onplay = () => {
      this.onPlay?.();
    };

    audio.onpause = () => {
      this.onPause?.();
    };

    audio.onended = () => {
      this.onEnded?.();
    };

    audio.onerror = () => {
      this.onError?.('오디오 재생에 실패했습니다.');
    };

    audio.play().catch((_error) => {
      this.onError?.('오디오 재생에 실패했습니다.');
    });
  }

  // 일시정지
  pause() {
    if (this.audioRef.current && !this.audioRef.current.paused) {
      this.audioRef.current.pause();
    }
  }

  // 재생 재개
  resume() {
    if (this.audioRef.current && this.audioRef.current.paused) {
      this.audioRef.current.play().catch((_error) => {
        this.onError?.('오디오 재생에 실패했습니다.');
      });
    }
  }

  // 정지
  stop() {
    if (this.audioRef.current) {
      this.audioRef.current.pause();
      this.audioRef.current.currentTime = 0;
    }
  }

  cleanup() {
    if (this.audioRef.current) {
      this.audioRef.current.pause();
      this.audioRef.current.src = '';
      this.audioRef.current.load();
      this.audioRef.current = null;
    }
  }

  // 특정 위치로 이동
  seekTo(position: number) {
    if (this.audioRef.current) {
      this.audioRef.current.currentTime = position * this.audioRef.current.duration;
    }
  }

  // 시간 건너뛰기
  skip(seconds: number) {
    if (this.audioRef.current) {
      this.audioRef.current.currentTime += seconds;
    }
  }
}

// Web Speech API 관련 유틸리티 함수들
export class TtsWebSpeech {
  private speechRef: React.MutableRefObject<SpeechSynthesisUtterance | null>;
  private progressInterval: NodeJS.Timeout | null = null;
  private onStart?: () => void;
  private onEnd?: () => void;
  private onError?: (error: string) => void;
  private onProgress?: (progress: number) => void;
  private isPaused: boolean = false;
  private currentContent: string = '';
  private currentProgress: number = 0;

  constructor(
    speechRef: React.MutableRefObject<SpeechSynthesisUtterance | null>,
    callbacks: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
      onProgress?: (progress: number) => void;
    } = {}
  ) {
    this.speechRef = speechRef;
    this.onStart = callbacks.onStart;
    this.onEnd = callbacks.onEnd;
    this.onError = callbacks.onError;
    this.onProgress = callbacks.onProgress;
  }

  // Web Speech API로 재생
  speak(content: string) {
    this.currentContent = content;
    this.currentProgress = 0;
    this.isPaused = false;

    this.cancel();
    setTimeout(() => {
      if (!speechSynthesis.speaking && !speechSynthesis.pending) {
        this.startSpeaking(content);
      }
    }, 100);

    const estimatedDuration = content.length * 100;
    return { estimatedDuration, interval: this.progressInterval };
  }

  private startSpeaking(content: string) {
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      this.onStart?.();
    };

    utterance.onend = () => {
      this.clearProgressTimer();
      this.onEnd?.();
    };

    utterance.onerror = (event) => {
      this.clearProgressTimer();
      console.error('Web Speech API 오류:', event);
      this.onError?.('음성 재생에 실패했습니다.');
    };

    this.speechRef.current = utterance;

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        speechSynthesis.speak(utterance);
      }, { once: true });
    } else {
      speechSynthesis.speak(utterance);
    }

    // 진행률 추적을 위한 타이머
    const estimatedDuration = content.length * 100;
    let currentTime = 0;

    this.progressInterval = setInterval(() => {
      if (!speechSynthesis.speaking) {
        this.clearProgressTimer();
        return;
      }

      if (!speechSynthesis.paused) {
        currentTime += 100;
        const progress = Math.min(currentTime / estimatedDuration, 1);
        this.currentProgress = progress;
        this.onProgress?.(progress);
      }
    }, 100);
  }

  // 일시정지
  pause() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        try {
          this.isPaused = true;
          speechSynthesis.pause();
        } catch (error) {
          console.error('Speech synthesis pause error:', error);
        }
      }
    }
  }

  // 재생 재개
  resume() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (speechSynthesis.paused) {
        try {
          this.isPaused = false;
          speechSynthesis.resume();
        } catch (error) {
          console.error('Speech synthesis resume error:', error);
          setTimeout(() => {
            if (speechSynthesis.paused) {
              try {
                speechSynthesis.resume();
              } catch (retryError) {
                console.error('Speech synthesis resume retry failed:', retryError);
              }
            }
          }, 100);
        }
      } else if (this.isPaused && !speechSynthesis.speaking) {
        this.isPaused = false;
      }
    }
  }

  // 정지 및 정리
  cancel() {
    this.clearProgressTimer();
    this.isPaused = false;
    this.currentProgress = 0;

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        if (speechSynthesis.speaking || speechSynthesis.pending) {
          speechSynthesis.cancel();
        }
        setTimeout(() => {
          if (speechSynthesis.speaking || speechSynthesis.pending) {
            speechSynthesis.cancel();
          }
        }, 50);
      } catch (error) {
        console.error('Speech synthesis cancel error:', error);
      }
    }

    this.speechRef.current = null;
  }

  // 진행률 타이머 정리
  private clearProgressTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

// 파일 다운로드 유틸리티
export class TtsFileDownloader {
  // fetch를 사용해 blob으로 안전하게 다운로드
  static async downloadFile(url: string, filename: string): Promise<void> {
    try {
      // fetch를 사용해서 파일을 blob으로 가져오기
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit', // CORS 이슈 방지
      });

      if (!response.ok) {
        throw new Error('파일 다운로드에 실패했습니다.');
      }

      const blob = await response.blob();

      // blob URL 생성
      const blobUrl = window.URL.createObjectURL(blob);

      // 다운로드 링크 생성 및 클릭
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // blob URL 해제 (메모리 누수 방지)
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {

      // 실패 시 기존 방식으로 폴백 (새 탭에서 열기)
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();

      throw error;
    }
  }
}
