
"use client"; // AppLayout now needs to be a client component for Supabase auth state

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // For redirects
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Settings, LifeBuoy, LogOut, Package } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client'; 
import type { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: ReactNode;
}

function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login'); 
      router.refresh(); 
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleLogout}
      className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}


export default function AppLayout({ children }: AppLayoutProps) {
  const appVersion = "0.1.0";
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setIsLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        // This logic can be simplified as the main check is below
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []); // Removed dependencies to avoid re-triggering excessively

  useEffect(() => {
    if (!isLoading) {
      if (!session && pathname !== '/login') {
        router.push('/login');
      } else if (session && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [session, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Loading application...</p>
      </div>
    );
  }
  
  if (!session && pathname !== '/login') {
    return null; 
  }

  const supabaseUser = session?.user ?? null;

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="flex flex-col text-sidebar-foreground bg-sidebar-DEFAULT border-r border-sidebar-border"
        >
          <SidebarHeader className="p-4 h-[calc(var(--sidebar-width-icon)_+_1rem)] flex items-center justify-center border-b border-sidebar-border relative group-data-[state=collapsed]/sidebar-wrapper:h-auto group-data-[state=collapsed]/sidebar-wrapper:p-2">
            {/* Collapsed Logo - Icon */}
            <div className="hidden group-data-[state=collapsed]/sidebar-wrapper:flex items-center justify-center w-full">
              <Link href="/dashboard">
                <Image
                  src="/logo-icon.png"
                  alt="StockSentry Icon"
                  width={500} 
                  height={500}
                  className="h-14 w-14" // Display size for collapsed
                />
              </Link>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 flex-grow">
            <SidebarNav />
          </SidebarContent>

          {/* Expanded Logo Section - Above Footer */}
          <div className="group-data-[state=collapsed]/sidebar-wrapper:hidden px-4 pb-2 pt-4 text-left leading-tight">
            <Link href="/dashboard" className="block">
               <Image
                  src="/logo.png"
                  alt="StockSentry Logo"
                  width={1024}
                  height={1024}
                  className="h-20 w-auto" // Display size
                  priority
                  data-ai-hint="logo company"
                />
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
              <UserMenu currentUser={supabaseUser} />
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

function UserMenu({ currentUser }: { currentUser: User | null }) {
  // Defensive defaults
  let fallback = "SP";
  let username = "My Account";
  let avatarSrc = "https://placehold.co/100x100.png"; // Default placeholder

  if (currentUser) {
    // currentUser is a Supabase User object. Its email property can be undefined.
    fallback = currentUser.email ? currentUser.email.substring(0, 2).toUpperCase() : "SP";
    username = currentUser.email || "My Account"; // Use email if available, otherwise "My Account"
    
    // Safely access avatar_url from user_metadata
    if (currentUser.user_metadata && typeof currentUser.user_metadata.avatar_url === 'string') {
      avatarSrc = currentUser.user_metadata.avatar_url;
    }
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
