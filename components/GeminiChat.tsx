// components/GeminiChat.tsx
'use client';

import { useState } from 'react';
import { geminiModel } from '@/lib/firebase'; // Updated import
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function GeminiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const userMessage = input.trim();
      setInput('');
      
      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

      // Generate response
      const result = await geminiModel.generateContent(userMessage);
      const response = result.response;
      const text = response.text();

      // Add assistant message to chat
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);

    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate response. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto p-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <Card 
            key={index}
            className={`p-4 ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground ml-12' 
                : 'bg-muted mr-12'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </Card>
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <Loading size={24} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          rows={3}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? <Loading size={16} className="mr-2" /> : null}
          Send
        </Button>
      </form>
    </div>
  );
}