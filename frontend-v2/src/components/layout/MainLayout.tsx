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
        <header className="flex h-14 items-center gap-2 px-4 lg:h-16 justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className='flex items-center justify-center gap-x-4'>
            <SidebarTrigger className="-ml-1 h-10 w-10 [&>svg]:!h-5 [&>svg]:!w-5" />
            <span className="font-semibold hidden md:block"></span>
          </div>

          <div className="flex items-center gap-2">
            {/* <ModeToggle /> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="rounded-full p-[2.5px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500">
                  <Button variant="ghost" className="rounded-full h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base shadow-[inset_0_0_0_1.5px_rgba(0,0,0,1)] p-0">
                    {user?.username ? getInitial(user.username) : <User className="h-4 w-4" />}
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">Logged In</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-[#ff0000] focus:text-[#ff0000]">
                  <LogOut className="mr-2 h-4 w-4 text-[#ff0000]" />
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
