import React, { useState } from 'react';
import { Plus, Trash2, Bot, Settings, Book, MoreVertical, Info, LogOut } from 'lucide-react';
import { useAssistants } from '@/contexts/AssistantContext';
import { useAuth } from '@/contexts/AuthContext';
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
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
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
import { ModeToggle } from '@/components/mode-toggle';
import { useTheme } from '@/components/theme-provider';

export const Sidebar: React.FC = () => {
  const { assistants, selectedAssistantId, selectAssistant, deleteAssistant } = useAssistants();
  const { logout } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { setTheme } = useTheme();

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId !== null) {
      await deleteAssistant(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <SidebarRoot collapsible="icon">
        {/* Header */}
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Orion" className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <h1 className="font-semibold text-sidebar-foreground">Orion</h1>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full h-12 justify-start gap-2 group-data-[collapsible=icon]:justify-center"
            variant="outline"
            disabled={assistants.length >= 3}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">New Assistant</span>
          </Button>
        </SidebarHeader>

        {/* Assistants List */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {assistants.length === 0 ? (
                  <div className="p-4 text-center group-data-[collapsible=icon]:hidden">
                    <p className="text-sm text-muted-foreground">No assistants yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create one to get started</p>
                  </div>
                ) : (
                  assistants.map((assistant) => (
                    <SidebarMenuItem key={assistant.id}>
                      <div className="flex items-center w-full relative group/item">
                        <SidebarMenuButton
                          onClick={() => selectAssistant(assistant.id)}
                          isActive={selectedAssistantId === assistant.id}
                          className="pr-8 group-data-[collapsible=icon]:pr-0"
                          tooltip={assistant.name}
                          size="lg"
                        >
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                            <Book className="h-4 w-4 text-foreground" />
                          </div>
                          <span className="flex-1 min-w-0 truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                            {assistant.name}
                          </span>
                        </SidebarMenuButton>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 absolute right-1 opacity-0 group-hover/item:opacity-100 transition-opacity ml-auto group-data-[collapsible=icon]:hidden"
                            >
                              <MoreVertical className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Assistant Options</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // In future: Show info modal
                              }}
                            >
                              <Info className="mr-2 h-4 w-4" />
                              View Info
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(assistant.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Settings Section (Footer) */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    size="lg"
                  >
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">Settings</span>
                      <span className="truncate text-xs text-muted-foreground">Preferences</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="right" align="end" sideOffset={16}>
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
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
