// lib/hooks/useChat.ts
import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, geminiModel } from '@/lib/firebase';
import { useAuth } from '@/lib/context/auth-context';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pending?: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const newMessages: ChatMessage[] = [];
        snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          newMessages.push({
            id: doc.id,
            role: data.role,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        });
        setMessages(newMessages);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch messages. Please try again.",
        });
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const addMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!user) return;

    await addDoc(collection(db, 'chats'), {
      userId: user.uid,
      content,
      role,
      timestamp: serverTimestamp(),
    });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !user) return;

    try {
      setIsLoading(true);

      // Add user message
      await addMessage(content.trim(), 'user');

      // Set up streaming response
      const result = await geminiModel.generateContentStream(content.trim());
      
      let fullResponse = '';
      
      // Add a pending message for the assistant
      const pendingMessageId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: pendingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        pending: true
      }]);

      // Process the stream
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        
        // Update the pending message with accumulated response
        setMessages(prev => prev.map(msg => 
          msg.id === pendingMessageId
            ? { ...msg, content: fullResponse }
            : msg
        ));
      }

      // Add the complete assistant message to Firestore
      await addMessage(fullResponse, 'assistant');

      // Remove the pending message
      setMessages(prev => prev.filter(msg => msg.id !== pendingMessageId));

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate response. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    messagesEndRef
  };
}