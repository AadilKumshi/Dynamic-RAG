import React, { useState } from 'react';
import { Plus, Trash2, Bot, Settings, Book, MoreVertical, Info, LogOut, Sun, Moon, Monitor, HelpCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
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
          <div className="flex items-center gap-2 px-2 h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div 
              onClick={() => {
                selectAssistant(null);
                navigate('/home');
              }}
              className="flex items-center gap-2 cursor-pointer group-data-[collapsible=icon]:justify-center"
            >
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Origo" className="h-10 w-10" />
              </div>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <h1 className="font-semibold text-sidebar-foreground text-lg">Origo</h1>
              </div>
            </div>
          </div>

          {isAdmin && (
            <Button
              onClick={() => navigate('/admin')}
              className="w-full h-10 justify-start gap-2 group-data-[collapsible=icon]:justify-center mb-2"
              variant="secondary"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Admin Dashboard</span>
            </Button>
          )}

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full h-12 justify-start gap-2 group-data-[collapsible=icon]:justify-center"
            variant="outline"
            disabled={!isAdmin && assistants.length >= 5}
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
                  <div className="flex flex-col items-center justify-center p-4 text-center group-data-[collapsible=icon]:hidden">
                    <p className="text-sm text-muted-foreground">No assistants yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create one to get started</p>
                  </div>
                ) : (
                  assistants.map((assistant) => (
                    <SidebarMenuItem key={assistant.id}>
                      <div className="flex items-center w-full relative group/item">
                        <SidebarMenuButton
                          onClick={() => {
                            selectAssistant(assistant.id);
                            navigate('/home');
                          }}
                          isActive={selectedAssistantId === assistant.id}
                          className="pr-8 group-data-[collapsible=icon]:pr-0"
                          tooltip={assistant.name}
                          size="lg"
                        >
                          <div className="h-10 w-7 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                            {assistant.image_base64 ? (
                              <img 
                                src={`data:image/png;base64,${assistant.image_base64}`} 
                                alt={assistant.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Book className="h-4 w-4 text-foreground" />
                            )}
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
                          <DropdownMenuContent align="start" className="w-44">
                            {/* <DropdownMenuLabel>Assistant Info</DropdownMenuLabel> */}
                            <div className="px-2 py-2 text-xs space-y-1.5">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Creativity Level:</span>
                                <span className="font-medium">{assistant.temperature}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Retrieval Depth:</span>
                                <span className="font-medium">{assistant.top_k}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Chunk Size:</span>
                                <span className="font-medium">{assistant.chunk_size}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Chunk Overlap:</span>
                                <span className="font-medium">{assistant.chunk_overlap}</span>
                              </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(assistant.id);
                              }}
                              className="text-[#ff0000] focus:text-[#ff0000]"
                            >
                              <Trash2 className="mr-2 h-4 w-4 text-[#ff0000]" />
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
                      <span className="truncate font-semibold">Settings & Preferences</span>
                      {/* <span className="truncate text-xs text-muted-foreground">Preferences</span> */}
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="right" align="end" sideOffset={16}>
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Help</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/guide')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    How to Use?
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem> */}
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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-[#ff0000] text-white hover:bg-[#ff0000]/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
