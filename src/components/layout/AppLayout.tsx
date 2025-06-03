
"use client"; 

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Settings, LifeBuoy, UserCircle } from 'lucide-react';
import SidebarNav from './SidebarNav';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

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

export default function AppLayout({ children }: AppLayoutProps) {
  const appVersion = "0.1.0";
  // The SidebarProvider's internal state will now control the "expanded" or "collapsed" state.
  // The `group/sidebar-wrapper` class and the reactive `data-sidebar-state` attribute 
  // are handled by the SidebarProvider itself.

  return (
    <SidebarProvider 
      defaultOpen={true} 
      className="flex min-h-screen w-full bg-background" // Moved layout classes here
    >
      <Sidebar
        variant="sidebar"
        collapsible="icon" 
        className={cn(
          "flex flex-col text-sidebar-foreground bg-sidebar-DEFAULT border-r border-sidebar-border"
          // SidebarProvider's div will have group/sidebar-wrapper and data-sidebar-state
          // The <aside> (this Sidebar component) uses group-data-[state=collapsed]/sidebar-wrapper for its width
        )}
      >
        <SidebarHeader className="p-4 h-[calc(var(--sidebar-width-icon)_+_1rem)] flex items-center justify-center border-b border-sidebar-border relative group-data-[state=collapsed]/sidebar-wrapper:h-auto group-data-[state=collapsed]/sidebar-wrapper:p-2 group-data-[state=collapsed]/sidebar-wrapper:justify-center">
          <div className="hidden group-data-[state=collapsed]/sidebar-wrapper:flex items-center justify-center w-full">
            <Link href="/dashboard">
              <Image
                src="/logo-icon.png"
                alt="StockSentry Icon"
                width={500} 
                height={500}
                className="h-14 w-14" 
                data-ai-hint="logo abstract"
              />
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2 flex-grow">
          <SidebarNav />
        </SidebarContent>
        
         <div className={cn(
          "group-data-[state=collapsed]/sidebar-wrapper:hidden text-left leading-tight px-4 pb-2 pt-4",
        )}>
          <Link href="/dashboard" className="block">
            <span className="block text-3xl font-bold text-primary uppercase">STOCK</span>
            <span className="block text-3xl font-bold text-primary uppercase">SENTRY</span>
          </Link>
        </div>
        
        <SidebarFooter className={cn(
          "p-4 pt-2 border-t border-sidebar-border text-left",
          "group-data-[state=collapsed]/sidebar-wrapper:hidden", 
        )}>
          <p className="text-xs text-muted-foreground w-full">
            Version {appVersion}
          </p>
        </SidebarFooter>
      </Sidebar>

      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out",
        "ml-0", 
        "md:ml-[var(--sidebar-width)]", 
        // This class correctly refers to the SidebarProvider's div state
        "group-data-[state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)]" 
      )}>
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
      </div>
    </SidebarProvider>
  );
}
