import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { assistantService, Assistant, CreateAssistantParams, CreateAssistantProgress } from '@/services/assistant.service';
import { useAuth } from './AuthContext';

interface AssistantContextType {
  assistants: Assistant[];
  selectedAssistantId: number | null;
  isLoading: boolean;
  error: string | null;
  fetchAssistants: () => Promise<void>;
  createAssistant: (params: CreateAssistantParams, onProgress: (data: CreateAssistantProgress) => void) => Promise<string>;
  deleteAssistant: (id: number) => Promise<void>;
  selectAssistant: (id: number | null) => void;
  getSelectedAssistant: () => Assistant | undefined;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchAssistants = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await assistantService.getAssistants();
      setAssistants(data);
    } catch (err) {
      setError('Failed to fetch assistants');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const createAssistant = useCallback(async (
    params: CreateAssistantParams,
    onProgress: (data: CreateAssistantProgress) => void
  ): Promise<string> => {
    const assistantId = await assistantService.createAssistant(params, onProgress);
    await fetchAssistants();
    return assistantId;
  }, [fetchAssistants]);

  const deleteAssistant = useCallback(async (id: number) => {
    await assistantService.deleteAssistant(id);
    setAssistants(prev => prev.filter(a => a.id !== id));
    if (selectedAssistantId === id) {
      setSelectedAssistantId(null);
    }
  }, [selectedAssistantId]);

  const selectAssistant = useCallback((id: number | null) => {
    setSelectedAssistantId(id);
  }, []);

  const getSelectedAssistant = useCallback(() => {
    return assistants.find(a => a.id === selectedAssistantId);
  }, [assistants, selectedAssistantId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssistants();
    }
  }, [isAuthenticated, fetchAssistants]);

  return (
    <AssistantContext.Provider
      value={{
        assistants,
        selectedAssistantId,
        isLoading,
        error,
        fetchAssistants,
        createAssistant,
        deleteAssistant,
        selectAssistant,
        getSelectedAssistant,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistants = () => {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistants must be used within an AssistantProvider');
  }
  return context;
};
