// app/(protected)/chat/page.tsx
import { GeminiChat } from '@/components/GeminiChat';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">AI Chat</h1>
      <GeminiChat />
    </div>
  );
}
