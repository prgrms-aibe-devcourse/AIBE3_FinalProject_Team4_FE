import { ChatMessage } from '@/src/types/ai';

interface Props {
  role: ChatMessage['role'];
  text?: ChatMessage['text'];
  isThinking?: boolean;
  children?: React.ReactNode;
}

export default function ChatBubble({ role, text, isThinking, children }: Props) {
  const isUser = role === 'user';

  return (
    <div className={`${isUser ? 'justify-end w-full flex' : 'justify-start w-full flex'}`}>
      <div
        className={`
          ${isUser ? 'max-w-[85%] bg-[#E9EEF6] px-4 py-1 rounded-2xl' : 'w-full min-w-[6rem] bg-transparent m-2'}
          text-sm leading-relaxed
          break-words [overflow-wrap:anywhere]
          ${isThinking ? 'animate-pulse' : ''}
        `}
      >
        {isThinking ? (
          <div className="inline-flex items-center gap-2 min-w-[4rem]">생각 중...</div>
        ) : (
          (children ?? <div className="whitespace-pre-wrap">{text}</div>)
        )}
      </div>
    </div>
  );
}
