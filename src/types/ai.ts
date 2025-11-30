// 채팅 메시지
type Role = 'user' | 'ai' | 'system';
type Feedback = 'like' | 'dislike' | null;
type ModelOptionValue = 'gpt-4o-mini' | '추가 예정' | '추가 예정2';

interface BaseMessage {
  id: number; // createdAt
  role: Role;
  text: string;
}

export interface UserMessage extends BaseMessage {
  role: 'user';
  model: ModelOptionValue; // 사용자가 선택한 모델
}

export interface AiMessage extends BaseMessage {
  role: 'ai';
  model: ModelOptionValue; // 응답 모델 표시용 (ex: GPT-4o-mini)
  feedback?: Feedback; // 좋아요/싫어요 등
}

export interface SystemMessage extends BaseMessage {
  role: 'system';
}

export type ChatMessage = UserMessage | AiMessage | SystemMessage;

export interface ModelOption {
  label: string;
  value: ModelOptionValue;
  enabled: boolean;
}

// API
export interface AiChatRequest {
  id?: number;
  message: string; // 사용자 메시지
  content?: string; // 추가 컨텍스트 (선택 사항)
  model?: ModelOptionValue; // 선택된 모델
}
