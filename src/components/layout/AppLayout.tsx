
import type { ReactNode } from 'react';
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
import type { CurrentUser } from '@/types/user';
import { logoutUser } from '@/lib/actions/userActions';
import { SubmitButton } from '@/components/shared/SubmitButton';


interface AppLayoutProps {
  children: ReactNode;
  currentUser: CurrentUser | null; 
}

// Logout Form Component for Server Action
function LogoutButton() {
  return (
    <form action={logoutUser} className="w-full">
      <button type="submit" className="flex items-center w-full px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Logout</span>
      </button>
    </form>
  );
}


export default function AppLayout({ children, currentUser }: AppLayoutProps) {
  const appVersion = "0.1.0"; 

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar
          variant="sidebar" 
          collapsible="icon" 
          className="fixed h-full flex flex-col w-[var(--sidebar-width)] border-r border-sidebar-border text-sidebar-foreground" 
        >
          <SidebarHeader className="p-4 flex items-center justify-start h-16 border-b border-sidebar-border">
            <p className="text-xs text-muted-foreground text-center w-full group-data-[collapsible=icon]:hidden">Version {appVersion}</p>
            <p className="text-xs text-muted-foreground text-center w-full hidden group-data-[collapsible=icon]:block">v{appVersion}</p>
          </SidebarHeader>
          <SidebarContent className="p-2 flex-grow"> 
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter className="p-6 border-t border-sidebar-border h-20 flex items-center justify-start"> {/* Adjusted padding and height */}
             <Link href="/dashboard" className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-primary uppercase group-data-[collapsible=icon]:hidden leading-tight text-left">
                  <span className="block">STOCK</span>
                  <span className="block">SENTRY</span>
                </h1>
                {/* Placeholder for icon-only version if needed when collapsed */}
                <h1 className="text-xl font-bold text-primary uppercase hidden group-data-[collapsible=icon]:flex flex-col items-center leading-tight">
                  <span className="block">S</span>
                  <span className="block">S</span>
                </h1>
             </Link>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 ml-[var(--sidebar-width)] group-data-[sidebar-state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)] transition-all duration-300 ease-in-out">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-6">
            <div> 
               <SidebarTrigger className="md:hidden text-foreground" /> 
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-card text-foreground hover:bg-muted"> 
                <Bell className="h-5 w-5" /> 
                <span className="sr-only">Toggle notifications</span>
              </Button>
              <UserMenu currentUser={currentUser} />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background"> 
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


function UserMenu({ currentUser }: { currentUser: CurrentUser | null }) {
  const fallback = currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : "SS";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full overflow-hidden h-8 w-8"> 
          <Avatar className="h-full w-full bg-card"> 
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
            <AvatarFallback className="bg-card text-foreground">{fallback}</AvatarFallback> 
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
        <DropdownMenuLabel>{currentUser?.username || "My Account"}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild>
          <Link href="/settings/options" className="flex items-center w-full cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border"/>
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

