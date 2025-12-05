'use client';
import { fetchModelAvailability } from '@/src/api/aiApi';
import { ApiError } from '@/src/api/aiChatApi';
import { useAiChatStreamMutation } from '@/src/api/useAiChatStream';
import { ChatMessage, ModelAvailabilityDto, ModelOption, ModelOptionValue } from '@/src/types/ai';
import { useEffect, useState } from 'react';
import Tooltip from '../Tooltip';
import AIChatBody from './AiChatBody';
import AiChatHeader from './AiChatHeader';
import AiChatSidebar from './AiChatSidebar';
import ChatBotButton from './ChatBotButton';

type DisplayMode = 'sidebar' | 'floating';

export default function AiChatPanel({ title, content }: { title?: string; content?: string }) {
  const DEFAULT_OPTIONS: ModelOption[] = [
    { label: 'GPT-4o mini', value: 'gpt-4o-mini', enabled: false },
    { label: 'GPT-4.1 mini', value: 'gpt-4.1-mini', enabled: false },
    { label: 'GPT-5 mini', value: 'gpt-5-mini', enabled: false },
  ];

  const DEFAULT_MODEL: ModelOption['value'] = 'gpt-4o-mini';

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DisplayMode>('sidebar');

  // 채팅 메시지 상태 (user/ai 모두)
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 모델 옵션/선택값/변경함수 상태를 여기서 관리
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(DEFAULT_OPTIONS);

  const [selectedModel, setSelectedModel] = useState<ModelOption['value']>(DEFAULT_MODEL);

  const isModelOptionValue = (name: string): name is ModelOptionValue =>
    name === 'gpt-4o-mini' || name === 'gpt-4.1-mini' || name === 'gpt-5-mini';

  // 모델 옵션을 API에서 불러와서 세팅
  // API 모델 이름을 ModelOptionValue로 매핑
  const modelNameToLabel = (name: string): string => {
    switch (name) {
      case 'gpt-4o-mini':
        return 'GPT-4o mini';
      case 'gpt-4.1-mini':
        return 'GPT-4.1 mini';
      case 'gpt-5-mini':
        return 'GPT-5 mini';
      default:
        return 'GPT-4o mini';
    }
  };

  useEffect(() => {
    fetchModelAvailability()
      .then((res) => {
        console.log('fetchModelAvailability response:', res);
        const data = res.data;

        const fetchedOptions: ModelOption[] = data
          .filter((m): m is ModelAvailabilityDto & { name: ModelOptionValue } =>
            isModelOptionValue(m.name),
          )
          .map((m) => ({
            label: modelNameToLabel(m.name),
            value: m.name,
            enabled: m.available,
          }));

        // API 결과가 비면 기본 옵션으로 fallback
        const options = fetchedOptions.length > 0 ? fetchedOptions : DEFAULT_OPTIONS;

        setModelOptions(options);

        setSelectedModel((prev) => {
          // 이전 선택이 새 옵션에도 있으면 그대로 유지
          const stillExists = options.find((o) => o.value === prev);
          if (stillExists) return prev;

          // 없으면 enabled 모델 중 첫 번째
          const firstEnabled = options.find((o) => o.enabled);
          return (firstEnabled ?? options[0]).value;
        });
      })
      .catch(() => {
        setModelOptions(DEFAULT_OPTIONS);
        setSelectedModel(DEFAULT_MODEL);
      });
  }, []);

  const handleModelChange = (value: ModelOption['value']) => {
    setSelectedModel(value);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'sidebar' ? 'floating' : 'sidebar'));
  };

  // 메시지 추가 함수 (user/ai 모두)
  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const aiChat = useAiChatStreamMutation({
    onChunk: (chunk) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];

        if (last?.role === 'ai') {
          return [...prev.slice(0, -1), { ...last, text: last.text + chunk }];
        }
        if (last?.role === 'user') {
          return [...prev, { id: Date.now(), role: 'ai', text: chunk, model: last.model }];
        }
        return prev;
      });
    },
    onMeta: (meta) => {
      setModelOptions((prev) =>
        prev.map((option) =>
          option.value === meta.name ? { ...option, enabled: meta.available } : option,
        ),
      );
    },
    onError: (e) => {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          // 로그인 유도 UI
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              role: 'system',
              text: '로그인이 필요해요. 로그인 후 다시 시도해 주세요.',
            },
          ]);
          return;
        }
        // 기타 에러 표시
        // toast.error(e.serverMsg || e.message);
        console.error(e.serverMsg || e.message);
      } else {
        // toast.error('알 수 없는 오류가 발생했어요.');
        console.error('알 수 없는 오류가 발생했어요.');
      }
    },
  });

  const handleSend = (text: string) => {
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text, model: selectedModel }]);

    aiChat.start({
      id: 1,
      message: text,
      content: content,
      model: selectedModel,
    });
  };

  return (
    <>
      {/* 열기 버튼 */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-35 group">
          <ChatBotButton onClick={() => setIsOpen(true)} ariaLabel="AI 채팅 열기" />
          <Tooltip
            text="안녕하세요. TexTok 블로그 작성 도우미입니다."
            className="bg-white text-[15px] text-gray-700 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)] rounded-[10px] px-2.5 py-1.5"
            animationClass="translate-x-1 group-hover:translate-x-0 origin-right"
            position="top-right"
          />
        </div>
      )}

      {/* 사이드바 모드 */}
      {isOpen && mode === 'sidebar' && (
        <AiChatSidebar
          onToggleMode={toggleMode}
          onClose={() => setIsOpen(false)}
          modelOptions={modelOptions}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          messages={messages}
          addMessage={addMessage}
          onSend={handleSend}
          aiChat={aiChat}
          blogTitle={title}
        />
      )}

      {/* 플로팅 모드 */}
      {isOpen && mode === 'floating' && (
        <div
          className="
            fixed bottom-6 right-6
            w-[min(28rem,100vw-3rem)]  /* 작은 화면 대응 */
            h-[min(600px,100dvh-3rem)]
            bg-white rounded-t-[20px] rounded-b-[40px] border border-gray-200
            shadow-[0_4px_12px_0_rgba(0,0,0,0.06),0_1.5px_4px_0_rgba(0,0,0,0.03)]
            z-35 flex flex-col
          "
        >
          <AiChatHeader mode={mode} onToggleMode={toggleMode} onClose={() => setIsOpen(false)} />

          {/* AI 채팅 컴포넌트 (내부만 스크롤) */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <AIChatBody
              modelOptions={modelOptions}
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              messages={messages}
              addMessage={addMessage}
              onSend={handleSend}
              aiChat={aiChat}
              blogTitle={title}
            />
          </div>
        </div>
      )}
    </>
  );
}
