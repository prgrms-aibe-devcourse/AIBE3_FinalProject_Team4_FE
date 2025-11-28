'use client';

import { useState } from 'react';

interface ChatBotButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export default function ChatBotButton({
  onClick,
  className = '',
  ariaLabel = 'AI 채팅',
}: ChatBotButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group 
        inline-flex items-center justify-center
        shrink-0 self-start
        text-main bg-white p-3 rounded-full border border-gray-200 
        shadow-[0_4px_8px_rgba(0,0,0,0.12)] 
        hover:shadow-[0_6px_12px_rgba(0,0,0,0.16)] 
        transition-shadow duration-200 
        ${className}`}
      aria-label={ariaLabel}
    >
      <BotIcon isHovered={isHovered} />
    </button>
  );
}

function BotIcon({ isHovered }: { isHovered: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-bot-message-square-icon lucide-bot-message-square transition-transform duration-200 group-hover:scale-110"
    >
      <path d="M12 6V2H8" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />

      {/* 눈 (깜빡임 애니메이션) */}
      <path d="M15 11v2">
        {!isHovered ? (
          <animate
            attributeName="d"
            values="M15 11v2;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 11v2;M15 11v2;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 11v2;M15 11v2;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 11v2;M15 11v2;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 11v2;M15 11v2;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 12.4v0.01;M15 11v2;M14 11.2v2;M13 11v2;M13 11v2;M13 12.4v0.01;M13 12.4v0.01;M13 12.4v0.01;M13 12.4v0.01;M13 11v2;M14 11.2v2;M15 11v2;M15 11v2"
            dur="100s"
            keyTimes="0;0.0001;0.00035;0.0006;0.00085;0.00165;0.2;0.2001;0.20035;0.2006;0.20085;0.20165;0.4;0.4001;0.40035;0.4006;0.40085;0.40165;0.6;0.6001;0.60035;0.6006;0.60085;0.60165;0.8;0.8001;0.80035;0.8006;0.80085;0.80165;0.80167;0.80267;0.85;0.8501;0.85035;0.8506;0.85085;0.85165;0.85167;0.85267;1"
            repeatCount="indefinite"
          />
        ) : (
          <animate
            attributeName="d"
            values="M15 11v2;M14 11.2v2;M13 11v2;M13 11v2;M14 11.2v2;M15 11v2;M15 11v2;M15 12.4v0.01;M15 12.4v0.01;M15 11v2;M15 11v2"
            dur="5s"
            keyTimes="0;0.015;0.03;0.43;0.445;0.46;0.9;0.908;0.918;0.928;1"
            repeatCount="indefinite"
          />
        )}
      </path>
      <path d="M9 11v2">
        {!isHovered ? (
          <animate
            attributeName="d"
            values="M9 11v2;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 11v2;M9 11v2;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 11v2;M9 11v2;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 11v2;M9 11v2;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 11v2;M9 11v2;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 12.4v0.01;M9 11v2;M8.5 11.2v1.8;M8 11v1.6;M8 11v1.6;M8 12.4v0.01;M8 12.4v0.01;M8 12.4v0.01;M8 12.4v0.01;M8 11v1.6;M8.5 11.2v1.8;M9 11v2;M9 11v2"
            dur="100s"
            keyTimes="0;0.0001;0.00035;0.0006;0.00085;0.00165;0.2;0.2001;0.20035;0.2006;0.20085;0.20165;0.4;0.4001;0.40035;0.4006;0.40085;0.40165;0.6;0.6001;0.60035;0.6006;0.60085;0.60165;0.8;0.8001;0.80035;0.8006;0.80085;0.80165;0.80167;0.80267;0.85;0.8501;0.85035;0.8506;0.85085;0.85165;0.85167;0.85267;1"
            repeatCount="indefinite"
          />
        ) : (
          <animate
            attributeName="d"
            values="M9 11v2;M8.5 11.2v1.8;M8 11v1.6;M8 11v1.6;M8.5 11.2v1.8;M9 11v2;M9 11v2;M9 12.4v0.01;M9 12.4v0.01;M9 11v2;M9 11v2"
            dur="5s"
            keyTimes="0;0.015;0.03;0.43;0.445;0.46;0.9;0.908;0.918;0.928;1"
            repeatCount="indefinite"
          />
        )}
      </path>
    </svg>
  );
}
