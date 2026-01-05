import React, { createContext, useContext, useState, useCallback } from 'react';
import { chatService } from '@/services/chat.service';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: number[];
  timestamp: Date;
}

interface ChatContextType {
  messages: Record<number, Message[]>;
  isLoadingResponse: boolean;
  sendMessage: (assistantId: number, query: string) => Promise<void>;
  getMessagesForAssistant: (assistantId: number) => Message[];
  clearMessages: (assistantId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  const sendMessage = useCallback(async (assistantId: number, query: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [assistantId]: [...(prev[assistantId] || []), userMessage],
    }));

    setIsLoadingResponse(true);

    try {
      const response = await chatService.sendMessage(assistantId, query);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.response,
        sources: response.sources,
        timestamp: new Date(),
      };

      setMessages(prev => ({
        ...prev,
        [assistantId]: [...(prev[assistantId] || []), assistantMessage],
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => ({
        ...prev,
        [assistantId]: [...(prev[assistantId] || []), errorMessage],
      }));
    } finally {
      setIsLoadingResponse(false);
    }
  }, []);

  const getMessagesForAssistant = useCallback((assistantId: number): Message[] => {
    return messages[assistantId] || [];
  }, [messages]);

  const clearMessages = useCallback((assistantId: number) => {
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[assistantId];
      return newMessages;
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoadingResponse,
        sendMessage,
        getMessagesForAssistant,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
