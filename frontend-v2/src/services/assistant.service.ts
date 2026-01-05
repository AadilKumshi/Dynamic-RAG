import api, { API_BASE_URL } from './api';

export interface Assistant {
  id: number;
  name: string;
  file_name: string;
  temperature: number;
  top_k: number;
}

export interface CreateAssistantProgress {
  status: 'processing' | 'uploading' | 'complete' | 'error';
  message: string;
  progress?: number;
  assistant_id?: string;
}

export interface CreateAssistantParams {
  name: string;
  temperature?: number;
  top_k?: number;
  chunk_size?: number;
  chunk_overlap?: number;
  file: File;
}

export const assistantService = {
  async getAssistants(): Promise<Assistant[]> {
    const response = await api.get<Assistant[]>('/assistants/');
    return response.data;
  },

  async createAssistant(
    params: CreateAssistantParams,
    onProgress: (data: CreateAssistantProgress) => void
  ): Promise<string> {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('name', params.name);
    formData.append('temperature', String(params.temperature ?? 0.5));
    formData.append('top_k', String(params.top_k ?? 5));
    formData.append('chunk_size', String(params.chunk_size ?? 500));
    formData.append('chunk_overlap', String(params.chunk_overlap ?? 50));
    formData.append('file', params.file);

    const response = await fetch(`${API_BASE_URL}/assistants/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('You have reached the maximum limit of 3 assistants. Please delete an existing assistant to create a new one.');
      }
      throw new Error('Failed to create assistant');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No reader available');

    let assistantId = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line) as CreateAssistantProgress;
          onProgress(data);

          if (data.status === 'error') {
            throw new Error(data.message);
          }

          if (data.status === 'complete' && data.assistant_id) {
            assistantId = data.assistant_id;
          }
        } catch (e) {
          if (e instanceof SyntaxError) {
            console.error('Failed to parse stream line:', line);
          } else {
            throw e;
          }
        }
      }
    }

    return assistantId;
  },

  async deleteAssistant(assistantId: number): Promise<void> {
    await api.delete(`/assistants/${assistantId}`);
  },
};
