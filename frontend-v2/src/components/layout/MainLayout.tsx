import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useAssistants } from '@/contexts/AssistantContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { ModeToggle } from '../mode-toggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { assistants } = useAssistants();

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <header className="flex h-14 items-center gap-2 border-b border-border/40 px-4 lg:h-16 justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className='flex items-center justify-center gap-x-4'>
            <SidebarTrigger className="-ml-1" />
            <span className="font-semibold hidden md:block">Orion</span>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  {user?.username ? getInitial(user.username) : <User className="h-4 w-4" />}
                </Button>
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
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
