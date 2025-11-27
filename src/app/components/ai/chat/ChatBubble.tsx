interface Props {
  role: 'user' | 'assistant';
  text: string;
}

export default function ChatBubble({ role, text }: Props) {
  const isUser = role === 'user';

  return (
    <div
      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed 
        ${isUser ? 'ml-auto bg-[#4C445C] text-white' : 'mr-auto bg-white shadow-sm'}
      `}
    >
      {text}
    </div>
  );
}
