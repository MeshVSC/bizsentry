
"use client"; 

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation'; 
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Settings, LifeBuoy, LogOut, LogIn } from 'lucide-react'; 
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

function UserMenu({ currentUser }: { currentUser: CurrentUser | null }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const result = await logoutUser(); // logoutUser should now always succeed in "paused auth"
      toast({ title: "Logged Out", description: "You have been logged out (session state cleared)." });
      router.push(result.redirectPath || "/login"); 
      router.refresh(); 
    } catch (error) {
      toast({ title: "Logout Failed", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
    }
  };
  
  const handleLoginRedirect = () => {
    router.push('/login'); // /login will redirect to /dashboard if auth is paused
  };

  if (!currentUser) {
    // Simplified menu for "Guest" or when auth is paused and currentUser is null
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8 bg-card">
              <AvatarFallback className="bg-card text-foreground">G</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
          <DropdownMenuLabel>Guest</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={handleLoginRedirect} className="cursor-pointer">
            <LogIn className="mr-2 h-4 w-4" />
            <span>Login</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full user menu if currentUser exists (though it won't in "fully paused auth" from layout)
  let fallback = currentUser.username ? currentUser.username.substring(0, 2).toUpperCase() : "U";
  let username = currentUser.username || "My Account";
  const avatarSrc = "https://placehold.co/100x100.png"; 

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
        <DropdownMenuItem 
          onSelect={(e) => { e.preventDefault(); handleLogout(); }}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AppLayout({ children, currentUser }: AppLayoutProps) {
  const appVersion = "0.1.0";
  
  // Determine sidebar state based on whether currentUser is null (auth paused) or not.
  // If auth is paused (currentUser is null), we might want the sidebar to be collapsed by default
  // or behave as if for a guest. For now, `defaultOpen` in SidebarProvider will control it.
  // The data-sidebar-state on the wrapper div is used by child components.
  const sidebarDataState = currentUser ? "expanded" : "collapsed"; // Example logic

  return (
    <SidebarProvider defaultOpen={!!currentUser}> {/* Sidebar open if user, else closed */}
      <div className="flex min-h-screen w-full bg-background group/sidebar-wrapper" data-sidebar-state={sidebarDataState}>
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
