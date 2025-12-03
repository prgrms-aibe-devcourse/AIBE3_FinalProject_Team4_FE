'use client';

import { useEffect, useRef, useState } from 'react';

export type UseRegisterViewOptions = {
  dwellMs: number;
  scrollThreshold?: number;
  noScrollRatio?: number;
  scrollContainer?: HTMLElement | null;

  onRegister: () => void | Promise<void>;

  /** 콘텐츠 고유 키 (예: "blog:123", "shorlog:55") */
  contentKey: string;

  /** 쿨다운(ms). 기본 30분 */
  cooldownMs?: number;
};

export function useRegisterView({
  dwellMs,
  scrollThreshold,
  noScrollRatio = 1.2,
  scrollContainer = null,
  onRegister,
  contentKey,
  cooldownMs = 30 * 60 * 1000,
}: UseRegisterViewOptions) {
  const registeredRef = useRef(false);
  const visibleRef = useRef(true);
  const rafRef = useRef<number | null>(null);
  const [contentIsShort, setContentIsShort] = useState(false);

  // cooldown check
  const isInCooldown = () => {
    try {
      const raw = localStorage.getItem(`view:${contentKey}`);
      if (!raw) return false;
      const lastTs = Number(raw);
      if (Number.isNaN(lastTs)) return false;
      return Date.now() - lastTs < cooldownMs;
    } catch {
      return false;
    }
  };

  const markCooldown = () => {
    try {
      localStorage.setItem(`view:${contentKey}`, String(Date.now()));
    } catch {}
  };

  // visibility tracking
  useEffect(() => {
    const onVisibility = () => {
      visibleRef.current = document.visibilityState === 'visible';
    };
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const registerOnce = async () => {
    if (registeredRef.current) return;
    if (isInCooldown()) return;

    registeredRef.current = true;
    markCooldown();

    try {
      await onRegister();
    } catch (e) {
      console.error('register view failed:', e);
      // 실패 시 재시도 허용하려면 아래 주석 해제
      // registeredRef.current = false;
      // localStorage.removeItem(`view:${contentKey}`);
    }
  };

  // scroll logic
  useEffect(() => {
    if (!scrollThreshold) return;

    const container = scrollContainer ?? document.documentElement;

    const computeShortness = () => {
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      setContentIsShort(scrollHeight <= clientHeight * noScrollRatio);
    };

    const onScroll = () => {
      if (registeredRef.current) return;
      if (isInCooldown()) return;

      const scrollTop =
        container === document.documentElement
          ? window.scrollY || document.documentElement.scrollTop
          : (container as HTMLElement).scrollTop;

      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll <= 0) {
        setContentIsShort(true);
        return;
      }

      const progress = scrollTop / maxScroll;
      if (progress >= scrollThreshold) registerOnce();
    };

    computeShortness();
    onScroll();

    window.addEventListener('resize', computeShortness);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', computeShortness);
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollThreshold, noScrollRatio, scrollContainer, contentKey, cooldownMs]);

  // dwell timer (visible-only)
  useEffect(() => {
    if (registeredRef.current) return;
    if (isInCooldown()) return;

    let accumulated = 0;
    let lastTick = performance.now();

    const tick = () => {
      if (registeredRef.current) return;
      if (isInCooldown()) return;

      const now = performance.now();
      const delta = now - lastTick;
      lastTick = now;

      if (visibleRef.current) accumulated += delta;

      const dwellEnabled = scrollThreshold == null || contentIsShort === true;

      if (dwellEnabled && accumulated >= dwellMs) {
        registerOnce();
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [dwellMs, scrollThreshold, contentIsShort, contentKey, cooldownMs]);

  return { contentIsShort };
}
