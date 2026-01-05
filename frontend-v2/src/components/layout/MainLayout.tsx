import React from 'react';
import { Sidebar } from './Sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '../mode-toggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-2 border-b px-4 lg:h-16 justify-between">
          <div className='flex items-center justify-center gap-x-4'>
            <SidebarTrigger className="-ml-1" />
            <span className="font-semibold">Dynamic RAG</span>
          </div>
          <ModeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
