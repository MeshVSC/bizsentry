
"use client"; 

import type { ReactNode } from 'react';
// Removed Supabase specific imports: useEffect, useState, useRouter, usePathname, supabase, Session, SupabaseUser
// Retain others as needed
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Settings, LifeBuoy, LogOut, User as UserIconLucide } from 'lucide-react'; // Added UserIconLucide as example
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
import { logoutUser } from '@/lib/actions/userActions'; // Custom logout action
import type { CurrentUser } from '@/types/user'; // Custom CurrentUser type

interface AppLayoutProps {
  children: ReactNode;
  currentUser: CurrentUser | null; // Receive currentUser as prop
}

function LogoutButton() {
  // useRouter is not needed here as logoutUser action handles redirect
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logoutUser(); // This server action will handle redirect
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      // No client-side redirect needed, server action handles it.
    } catch (error) {
      toast({ title: "Logout Failed", description: (error as Error).message || "An error occurred.", variant: "destructive" });
    }
  };

  return (
    // Using onSelect for DropdownMenuItem to prevent default browser navigation
    // if we were using an anchor tag, and to ensure our async handler is called.
    <DropdownMenuItem 
      onSelect={handleLogout} // Use onSelect for DropdownMenuItem for custom async actions
      className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}

function UserMenu({ currentUser }: { currentUser: CurrentUser | null }) {
  let fallback = "U"; // Default fallback
  let username = "My Account";
  const avatarSrc = "https://placehold.co/100x100.png"; // Placeholder avatar

  if (currentUser) {
    fallback = currentUser.username ? currentUser.username.substring(0, 2).toUpperCase() : "U";
    username = currentUser.username || "My Account";
    // If you store avatar URLs in your custom user table, you'd fetch it here.
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
        <DropdownMenuItem disabled> {/* Assuming support is not yet implemented */}
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
  // Removed Supabase specific useEffect, useState for session, isLoading, authError

  // If GroupedAppLayout handles the redirect for !currentUser, AppLayout won't render for unauth users.
  // If currentUser is null here, it means GroupedAppLayout might not be redirecting correctly,
  // or this component is being rendered in a path not covered by GroupedAppLayout's auth check.
  // However, with the current plan, GroupedAppLayout should redirect.

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background group/sidebar-wrapper" data-sidebar-state={currentUser ? 'expanded' : 'collapsed'}> {/* Simplified data-sidebar-state for example */}
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className={cn(
            "flex flex-col text-sidebar-foreground bg-sidebar-DEFAULT border-r border-sidebar-border"
            // Width classes are now managed internally by Sidebar component based on its state
          )}
        >
          <SidebarHeader className="p-4 h-[calc(var(--sidebar-width-icon)_+_1rem)] flex items-center justify-center border-b border-sidebar-border relative group-data-[state=collapsed]/sidebar-wrapper:h-auto group-data-[state=collapsed]/sidebar-wrapper:p-2 group-data-[state=collapsed]/sidebar-wrapper:justify-center">
            {/* Collapsed Logo - Icon */}
            <div className="hidden group-data-[state=collapsed]/sidebar-wrapper:flex items-center justify-center w-full">
              <Link href="/dashboard">
                <Image
                  src="/logo-icon.png"
                  alt="StockSentry Icon"
                  width={500} 
                  height={500}
                  className="h-14 w-14" // Doubled size
                  data-ai-hint="logo abstract"
                />
              </Link>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 flex-grow">
            <SidebarNav />
          </SidebarContent>
          
          {/* Expanded Logo Section - Above Footer */}
           <div className={cn(
            "group-data-[state=collapsed]/sidebar-wrapper:hidden text-left leading-tight px-4 pb-2 pt-4",
            // Logic for expanded logo: "STOCK" over "SENTRY"
          )}>
            <Link href="/dashboard" className="block">
              <span className="block text-3xl font-bold text-primary uppercase">STOCK</span>
              <span className="block text-3xl font-bold text-primary uppercase">SENTRY</span>
            </Link>
          </div>
          
          <SidebarFooter className={cn(
            "p-4 pt-2 border-t border-sidebar-border text-left",
            "group-data-[state=collapsed]/sidebar-wrapper:hidden", // Hidden when sidebar is collapsed
          )}>
            <p className="text-xs text-muted-foreground w-full">
              Version {appVersion}
            </p>
          </SidebarFooter>
        </Sidebar>

        <div className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          "ml-0", // Default for mobile
          "md:ml-[var(--sidebar-width)]", // Margin for expanded sidebar on md+
          "group-data-[state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)]" // Margin for collapsed sidebar on md+
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
              <UserMenu currentUser={currentUser} /> {/* Pass currentUser to UserMenu */}
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
