'use client';

import { useEffect } from 'react';

/**
 * highlightId: 강조할 댓글 ID
 * setExpand: 특정 댓글이 속한 부모 댓글을 펼치기 위해 호출할 함수
 */
export function useHighlightComment(highlightId: number | null, expandTreeFn: Function) {
  useEffect(() => {
    if (!highlightId) return;

    expandTreeFn(highlightId);

    setTimeout(() => {
      const el = document.getElementById(`comment-${highlightId}`);
      if (!el) return;

      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      el.classList.add('highlight-comment');
      setTimeout(() => el.classList.remove('highlight-comment'), 2000);
    }, 50);
  }, [highlightId, expandTreeFn]);
}
