import React, { useEffect, useRef, useState } from 'react';
import { Bot, MoreVertical, Trash2, Info } from 'lucide-react';
import { useAssistants } from '@/contexts/AssistantContext';
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import { GeminiWelcome } from './GeminiWelcome';
import { CreateAssistantModal } from '@/components/assistant/CreateAssistantModal';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ChatArea: React.FC = () => {
  const { assistants, selectedAssistantId, getSelectedAssistant, deleteAssistant, selectAssistant } = useAssistants();
  const { getMessagesForAssistant, sendMessage, isLoadingResponse } = useChat();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const selectedAssistant = getSelectedAssistant();
  const messages = selectedAssistantId ? getMessagesForAssistant(selectedAssistantId) : [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, isLoadingResponse]);

  const handleSendMessage = (message: string) => {
    if (selectedAssistantId) {
      sendMessage(selectedAssistantId, message);
      setInputMessage('');
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedAssistantId) {
      await deleteAssistant(selectedAssistantId);
      setDeleteConfirmOpen(false);
    }
  };

  // Show welcome screen if no assistants exist
  if (assistants.length === 0) {
    return (
      <>
        <WelcomeScreen
          onCreateAssistant={() => setIsCreateModalOpen(true)}
          canCreate={true}
        />
        <CreateAssistantModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </>
    );
  }

  // If assistants exist but none selected, show welcome screen
  if (!selectedAssistant) {
    if (assistants.length > 0) {
      return (
        <>
          <WelcomeScreen
            onCreateAssistant={() => setIsCreateModalOpen(true)}
            canCreate={assistants.length < 3}
          />
          <CreateAssistantModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </>
      )
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Messages Area */}
      {messages.length === 0 && selectedAssistant ? (
        // Welcome screen with centered input
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div className="flex flex-col items-center justify-center w-full space-y-4 -mt-36">
            <GeminiWelcome
              assistant={selectedAssistant}
              onSuggestionClick={setInputMessage}
            />
            {/* Centered Input */}
            <div className="w-full max-w-3xl mx-auto">
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoadingResponse}
                placeholder="Ask a question..."
                value={inputMessage}
                onChange={setInputMessage}
              />
            </div>
          </div>
        </div>
      ) : (
        // Regular chat view with bottom input
        <>
          <ScrollArea className="flex-1 scroll-smooth">
            <div className="max-w-3xl mx-auto p-4 space-y-6 pb-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoadingResponse && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <img src="/logo.png" alt="Orion" className="h-4 w-4" />
                  </div>
                  <div className="px-4 py-3 bg-muted/50 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-px" />
            </div>
          </ScrollArea>

          {/* Input Area - Pinned to bottom */}
          <div className="p-4 bg-background mt-auto shrink-0">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoadingResponse}
              placeholder="Ask a question..."
              value={inputMessage}
              onChange={setInputMessage}
            />
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAssistant?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateAssistantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
