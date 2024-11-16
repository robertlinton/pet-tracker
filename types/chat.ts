// types/chat.ts
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    pending?: boolean;
  }
  