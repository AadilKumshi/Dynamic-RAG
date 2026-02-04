import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  sources: number[];
}

export interface ChatRequest {
  assistant_id: number;
  query: string;
  chat_history?: ChatMessage[];
}

export const chatService = {
  async sendMessage(
    assistantId: number, 
    query: string, 
    chatHistory?: ChatMessage[]
  ): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat/', {
      assistant_id: assistantId,
      query,
      chat_history: chatHistory || [],
    });
    return response.data;
  },
};
