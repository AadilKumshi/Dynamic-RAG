import React, { useState } from 'react';
import { Plus, Trash2, Bot, LogOut, User, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssistants } from '@/contexts/AssistantContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
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
import { CreateAssistantModal } from '@/components/assistant/CreateAssistantModal';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { assistants, selectedAssistantId, selectAssistant, deleteAssistant } = useAssistants();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId !== null) {
      await deleteAssistant(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <SidebarRoot collapsible="offcanvas">
        {/* Header */}
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sidebar-foreground">Dynamic RAG</h1>
              <p className="text-xs text-muted-foreground">Document Chat</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="w-full justify-start gap-2"
            disabled={assistants.length >= 3}
          >
            <Plus className="h-4 w-4" />
            New Assistant
          </Button>
          {assistants.length >= 3 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Max 3 assistants reached
            </p>
          )}
        </SidebarHeader>

        {/* Assistants List */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {assistants.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No assistants yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create one to get started</p>
                  </div>
                ) : (
                  assistants.map((assistant) => (
                    <SidebarMenuItem key={assistant.id}>
                      <SidebarMenuButton
                        onClick={() => selectAssistant(assistant.id)}
                        isActive={selectedAssistantId === assistant.id}
                        className="group relative"
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{assistant.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{assistant.file_name}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(assistant.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all absolute right-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User Section */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-auto py-2">
                    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
                      {user ? getInitial(user.username) : <User className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user?.username || 'User'}
                      </p>
                    </div>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">Logged in</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarRoot>

      {/* Create Assistant Modal */}
      <CreateAssistantModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assistant? This action cannot be undone and all chat history will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
