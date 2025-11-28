'use client';

import { useEffect, useRef } from 'react';

export default function SidebarMorePopover({
  logout,
  onClose,
}: {
  logout: () => Promise<void>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2
      w-44 bg-white border border-gray-200 shadow-md rounded-lg p-2 z-50"
    >
      <button onClick={logout} className="w-full px-3 py-2 rounded-md text-left hover:bg-gray-100">
        로그아웃
      </button>
    </div>
  );
}
