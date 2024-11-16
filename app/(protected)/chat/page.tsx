// app/(protected)/chat/page.tsx
import { GeminiChat } from '@/components/GeminiChat';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-6">
      <GeminiChat />
    </div>
  );
}