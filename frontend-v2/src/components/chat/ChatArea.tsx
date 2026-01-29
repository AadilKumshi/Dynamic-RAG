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
  const selectedAssistant = getSelectedAssistant();
  const messages = selectedAssistantId ? getMessagesForAssistant(selectedAssistantId) : [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingResponse]);

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

  // If assistants exist but none selected, select the first one or show a prompt
  // For now, if no selection, we might want to just select the first one automatically or show a generic "Select an assistant"
  // But based on "Once the user creates his first agent that should be his welcome screen", likely auto-select.
  if (!selectedAssistant) {
    if (assistants.length > 0) {
      // Auto-select first if available logic is handled in context or here
      // For visual validation, let's assume one is selected or user selects one.
      // If not selected, show a "Select to chat" empty state.
      return (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
          <p>Select an assistant to start chatting</p>
        </div>
      )
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Chat Header - Only show when there are messages */}
      {messages.length > 0 && selectedAssistant && (
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/95 backdrop-blur z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src="/logo.png" alt="Orion" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{selectedAssistant.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <p>Creativity: {selectedAssistant.temperature}</p>
                  <p>Chunks: {selectedAssistant.top_k}</p>
                </div>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Assistant
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 scroll-smooth">
        <div className="max-w-3xl mx-auto p-4 space-y-6 pb-4">
          {messages.length === 0 && selectedAssistant ? (
            <GeminiWelcome
              assistant={selectedAssistant}
              onSuggestionClick={setInputMessage}
            />
          ) : (
            <>
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
            </>
          )}
          <div ref={messagesEndRef} className="h-px" />
        </div>
      </ScrollArea>

      {/* Input Area - Pinned to bottom */}
      <div className="p-4 bg-background mt-auto">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoadingResponse}
          placeholder="Ask a question..."
          value={inputMessage}
          onChange={setInputMessage}
        />
      </div>

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
