// components/GeminiChat.tsx
'use client';
  
import { useRef, useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { format } from 'date-fns';
import { 
  Bot, 
  User, 
  Send, 
  Eraser,
  Copy, 
  CheckCheck 
} from 'lucide-react';

export function GeminiChat() {
  const { messages, isLoading, sendMessage, messagesEndRef } = useChat();
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <h2 className="text-xl font-semibold">AI Assistant</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput('')}
          disabled={!input}
        >
          <Eraser className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <Card 
            key={message.id}
            className={`p-4 ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground ml-12' 
                : 'bg-muted mr-12'
            } ${message.pending ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-background/10">
                {message.role === 'user' ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(message.timestamp, 'HH:mm')}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'assistant' && !message.pending && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedId === message.id ? (
                    <CheckCheck className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="pt-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message... (Shift + Enter for new line)"
            className="flex-1 min-h-[3rem] max-h-[12rem] resize-none"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loading size={16} className="mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </form>
    </div>
  );
}

