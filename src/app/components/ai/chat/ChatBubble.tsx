interface Props {
  role: 'user' | 'assistant';
  text: string;
}

export default function ChatBubble({ role, text }: Props) {
  const isUser = role === 'user';

  const preserveEdgeSpaces = (s: string) =>
    s
      .replace(/^ +/gm, (m) => '\u00A0'.repeat(m.length))
      .replace(/ +$/gm, (m) => '\u00A0'.repeat(m.length));
  const safeText = preserveEdgeSpaces(text);

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] px-4 py-1 rounded-2xl
          text-[15px] leading-relaxed font-extralight
          whitespace-pre-wrap break-words [overflow-wrap:anywhere]
          ${isUser ? 'bg-[#E9EEF6]' : 'bg-white shadow-sm'}
        `}
      >
        {safeText}
      </div>
    </div>
  );
}
