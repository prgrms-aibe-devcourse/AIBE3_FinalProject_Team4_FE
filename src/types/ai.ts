export type Role = 'user' | 'assistant' | 'system';

export type AIMessage = {
  id: number;
  role: Role;
  text: string;
  time?: string;
};
