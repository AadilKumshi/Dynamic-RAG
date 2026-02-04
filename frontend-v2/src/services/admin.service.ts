import api from './api';

export interface UserWithAssistants {
  id: number;
  username: string;
  role: string;
  assistants: {
    id: number;
    name: string;
    file_name: string;
    temperature: number;
    top_k: number;
    chunk_size: number;
    chunk_overlap: number;
    image_base64?: string;
  }[];
}

export const adminService = {
  async getAllUsers(): Promise<UserWithAssistants[]> {
    const response = await api.get<UserWithAssistants[]>('/admin/users');
    return response.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/admin/user/${userId}`);
  },

  async deleteAssistant(assistantId: number): Promise<void> {
    await api.delete(`/admin/assistant/${assistantId}`);
  },

  async grantAdminPrivileges(userId: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/admin/grant-admin/${userId}`);
    return response.data;
  },
};
