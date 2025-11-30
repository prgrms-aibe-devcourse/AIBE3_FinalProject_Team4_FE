import { ChatMessage } from '@/src/types/ai';

interface Props {
  role: ChatMessage['role'];
  text?: ChatMessage['text'];
  children?: React.ReactNode;
}

export default function ChatBubble({ role, text, children }: Props) {
  const isUser = role === 'user';

  return (
    <div className={`${isUser ? 'justify-end w-full flex' : 'w-full'}`}>
      <div
        className={`
          ${isUser ? 'max-w-[85%] bg-[#E9EEF6] px-4 py-1 rounded-2xl' : 'w-full bg-transparent m-2'}
          text-[15px] leading-relaxed font-extralight
          break-words [overflow-wrap:anywhere]
        `}
      >
        {/* AI 대답 메시지인 경우 마크다운 렌더링 필요하므로 children 으로 */}
        {children ?? <div className="whitespace-pre-wrap">{text}</div>}
      </div>
    </div>
  );
}
