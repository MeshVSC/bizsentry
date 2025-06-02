
"use client"; 

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Settings, LifeBuoy, LogOut } from 'lucide-react'; 
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
import { useToast } from '@/hooks/use-toast';
import { logoutUser } from '@/lib/actions/userActions'; 
import type { CurrentUser } from '@/types/user'; 

interface AppLayoutProps {
  children: ReactNode;
  currentUser: CurrentUser | null; 
}

function LogoutButton() {
  const router = useRouter(); // Get router instance
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push(result.redirectPath || "/login"); 
        router.refresh(); // Ensure full state refresh
      } else {
         toast({ title: "Logout Failed", description: result.message || "An error occurred.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Logout Failed", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  return (
    <DropdownMenuItem 
      onSelect={(e) => { e.preventDefault(); handleLogout(); }} // Prevent default and call handler
      className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}

function UserMenu({ currentUser }: { currentUser: CurrentUser | null }) {
  let fallback = "U"; 
  let username = "My Account";
  const avatarSrc = "https://placehold.co/100x100.png"; 

  if (currentUser) {
    fallback = currentUser.username ? currentUser.username.substring(0, 2).toUpperCase() : "U";
    username = currentUser.username || "My Account";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full overflow-hidden h-8 w-8">
          <Avatar className="h-full w-full bg-card">
            <AvatarImage src={avatarSrc} alt="User Avatar" data-ai-hint="user avatar" />
            <AvatarFallback className="bg-card text-foreground">{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
        <DropdownMenuLabel>{username}</DropdownMenuLabel>
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
        <DropdownMenuSeparator className="bg-border"/>
        <LogoutButton /> 
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AppLayout({ children, currentUser }: AppLayoutProps) {
  const appVersion = "0.1.0";
  
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background group/sidebar-wrapper" data-sidebar-state={currentUser ? 'expanded' : 'collapsed'}>
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className={cn(
            "flex flex-col text-sidebar-foreground bg-sidebar-DEFAULT border-r border-sidebar-border"
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
              <UserMenu currentUser={currentUser} /> 
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
