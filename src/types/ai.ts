// ================== [API 타입] ======================================================
// types/aiApi.ts

// ================== API 공통 타입 ==================
export interface RsData<T> {
  resultCode: string;
  msg: string;
  data: T;
}

// ================== AI 생성/추천/요약 관련 API 타입 ==================

// 생성 모드
export type AiGenerateMode = 'hashtag' | 'summary' | 'title' | 'keyword';
// blog/shorlog 구분
export type AiGenerateContentType = 'blog' | 'shorlog';

// 생성 요청
export interface AiGenerateRequest {
  mode: AiGenerateMode;
  contentType: AiGenerateContentType;
  content: string;
  message?: string;
  previousResults?: string[];
}

// 생성 응답 (results: string[] or result: string)
export interface AiGenerateMultiResults {
  results: string[];
}
export interface AiGenerateSummaryResult {
  result: string;
}

// ================== AI 채팅 관련 API 타입 ==================

// 채팅 요청
export interface AiChatRequest {
  id?: number;
  message: string; // 사용자 메시지
  content?: string; // 추가 컨텍스트 (선택 사항)
  model: ModelOptionValue; // 선택된 모델
}

// 채팅 모델 (채팅 컴포넌트 공통)
export type ModelOptionValue = 'gpt-4o-mini' | 'gpt-4.1-mini' | 'gpt-5-mini';

// 모델 사용 가능 여부 응답 DTO
export interface ModelAvailabilityDto {
  id: number; // 모델 ID
  name: string; // 모델 이름
  available: boolean;
  reason?: string;
}

// ================== [컴포넌트 타입] ======================================================
// types/aiComponent.ts

// ================== 채팅/컴포넌트 내부 타입 ==================

// 채팅 모델 옵션
export interface ModelOption {
  label: string;
  value: ModelOptionValue;
  enabled: boolean;
}

// 채팅 메시지
type Role = 'user' | 'ai' | 'system';
type Feedback = 'like' | 'dislike' | null;

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
