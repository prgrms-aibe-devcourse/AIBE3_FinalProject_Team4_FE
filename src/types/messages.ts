export type UserMini = {
  id: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
};

export type SharedContent = {
  type: 'shorlog' | 'blog';
  title: string;
  summary: string;
  thumbnailUrl?: string;
  href: string;
};

export type ChatMessage = {
  id: string;
  at: string;
  sender: 'me' | 'them';
  text?: string;
  shared?: SharedContent;
};

export type MessageThread = {
  id: string;
  user: UserMini;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
  messages: ChatMessage[];
};
