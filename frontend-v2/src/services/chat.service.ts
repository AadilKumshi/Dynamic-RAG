import api from './api';

export interface ChatResponse {
  response: string;
  sources: number[];
}

export interface ChatRequest {
  assistant_id: number;
  query: string;
}

export const chatService = {
  async sendMessage(assistantId: number, query: string): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat/', {
      assistant_id: assistantId,
      query,
    });
    return response.data;
  },
};
