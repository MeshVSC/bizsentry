
"use client"; 

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Settings, LifeBuoy, UserCircle } from 'lucide-react';
import SidebarNav from './SidebarNav';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import FloatingActionButton from '@/components/ui/floating-action-button';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface AppLayoutProps {
  children: ReactNode;
}

function SimplifiedUserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full overflow-hidden h-8 w-8">
          <Avatar className="h-full w-full bg-card">
            <UserCircle className="h-6 w-6 text-foreground m-auto" /> 
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
        <DropdownMenuLabel>Menu</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild>
          <Link href="/settings/application" className="flex items-center w-full cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled> 
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const SIDEBAR_WIDTH = "200px";
  const SIDEBAR_WIDTH_ICON = "48px";

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <>
      <Sidebar
        variant="sidebar"
        collapsible="icon" 
        className={cn(
          "flex flex-col text-sidebar-foreground bg-sidebar-DEFAULT border-r border-sidebar-border"
          // SidebarProvider's div will have group/sidebar-wrapper and data-sidebar-state
          // The <aside> (this Sidebar component) uses group-data-[state=collapsed]/sidebar-wrapper for its width
        )}
      >
        <SidebarHeader className="p-4 h-16 flex items-center justify-center border-b border-sidebar-border relative">
          {!isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <Link href="/dashboard">
                <Image
                  src="/logo-icon-custom.png"
                  alt="StockSentry Custom Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="p-2 flex-grow">
          <SidebarNav />
        </SidebarContent>
        
         <div className="text-left leading-tight px-4 pb-2 pt-4">
           <Link href="/dashboard" className="block">
             <div className="flex items-start">
               <span className="text-7xl font-thin text-primary uppercase leading-none mr-1" style={{transform: 'scaleY(1.2)'}}>S</span>
               {!isCollapsed && (
                 <div className="flex flex-col justify-start h-20">
                   <div className="h-6"></div>
                   <span className="text-xl font-bold text-primary uppercase leading-none">TOCK</span>
                   <span className="text-xl font-bold text-primary uppercase leading-none">ENTRY</span>
                 </div>
               )}
             </div>
           </Link>
         </div>
        
      </Sidebar>

      <div 
        style={{
          marginLeft: isCollapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH,
        }}
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out"
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-1 border-b border-border bg-background px-4 sm:px-6 sm:gap-2 md:gap-4">
          <div>
            <SidebarTrigger className="text-foreground" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-card text-foreground hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <SimplifiedUserMenu /> 
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">
          {children}
        </main>
        <FloatingActionButton href="/inventory/add" title="Add new inventory item" />
      </div>
    </>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider 
      defaultOpen={true} 
      className="flex min-h-screen w-full bg-background"
    >
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
