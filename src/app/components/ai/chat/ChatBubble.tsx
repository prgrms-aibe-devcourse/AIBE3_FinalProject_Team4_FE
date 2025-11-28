interface Props {
  role: 'user' | 'assistant';
  text: string;
}

export default function ChatBubble({ role, text }: Props) {
  const isUser = role === 'user';

  return (
    <div
      className={`w-fit max-w-[85%] px-4 py-1 rounded-3xl text-[15px] leading-relaxed font-extralight break-words
        ${isUser ? 'ml-auto bg-[#E9EEF6]' : 'mr-auto bg-white shadow-sm'}
      `}
    >
      {text}
    </div>
  );
}
