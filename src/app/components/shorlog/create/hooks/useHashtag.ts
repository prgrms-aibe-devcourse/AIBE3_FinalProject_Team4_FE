import { useState } from 'react';
import { callAiApi } from '../api';

export function useHashtag(initialHashtags: string[] = []) {
  const [hashtags, setHashtags] = useState<string[]>(initialHashtags);
  const [hashtagInput, setHashtagInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const addHashtagFromInput = () => {
    let value = hashtagInput.trim();
    if (!value) return;

    if (value.startsWith('#')) value = value.slice(1);
    if (!value) return;

    if (hashtags.includes(value)) {
      setHashtagInput('');
      return;
    }
    if (hashtags.length >= 10) {
      return { error: '해시태그는 최대 10개까지 입력할 수 있어요.' };
    }

    setHashtags((prev) => [...prev, value]);
    setHashtagInput('');
    return { error: null };
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addHashtagFromInput();
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAiHashtagClick = async (content: string) => {
    if (!content.trim()) {
      return { error: 'AI 해시태그 추천을 사용하려면 내용이 필요해요.' };
    }

    setIsAiLoading(true);

    try {
      const response = await callAiApi({
        mode: 'hashtag',
        content: content.trim(),
      });

      const suggested = response.data?.results || [];
      const merged = [...hashtags];
      suggested.forEach((tag: string) => {
        if (merged.length < 10 && !merged.includes(tag)) merged.push(tag);
      });
      setHashtags(merged);
      return { error: null };
    } catch (e) {
      console.error(e);
      return { error: e instanceof Error ? e.message : 'AI 해시태그 추천 호출 중 오류가 발생했습니다.' };
    } finally {
      setIsAiLoading(false);
    }
  };

  return {
    hashtags,
    setHashtags,
    hashtagInput,
    setHashtagInput,
    isAiLoading,
    addHashtagFromInput,
    handleHashtagKeyDown,
    removeHashtag,
    handleAiHashtagClick,
  };
}

