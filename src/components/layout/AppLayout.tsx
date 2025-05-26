
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar'; // Removed SidebarInset for now
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

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const appVersion = "0.1.0"; // Example version

  return (
    <SidebarProvider defaultOpen> {/* Ensure SidebarProvider wraps the structure */}
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar
          variant="sidebar" // This should apply `bg-sidebar` from `globals.css`
          collapsible="icon" // Keeps collapsible behavior
          className="fixed h-full flex flex-col w-[256px] border-r border-sidebar-border text-sidebar-foreground" // Explicit width and vertical flex
        >
          <SidebarHeader className="p-6 flex items-center justify-center h-16"> {/* padding 24px, fixed height for header */}
             <Link href="/dashboard" className="flex items-center">
                {/* Replace with your actual logo. Ensure it's in /public folder */}
                <Image 
                  src="https://placehold.co/160x32.png?text=StockSentry" // Adjusted placeholder for 32px height
                  alt="StockSentry Logo" 
                  width={128} // Adjusted width to maintain aspect ratio for 32px height
                  height={32} 
                  className="h-8 w-auto" // height 32px
                  data-ai-hint="logo company" 
                />
             </Link>
          </SidebarHeader>
          <SidebarContent className="p-2 flex-grow"> {/* flex-grow to take available space */}
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground text-center">Version {appVersion}</p> {/* Version Stamp */}
          </SidebarFooter>
        </Sidebar>

        {/* Main content area needs margin-left to account for the fixed sidebar */}
        <div className="flex flex-col flex-1 ml-[256px] group-data-[sidebar-state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)] transition-all duration-300 ease-in-out">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-transparent px-6"> {/* Height 64px, transparent BG, px-6 for padding */}
            {/* Page title will be rendered by PageHeader component used within children. Removed explicit title here. */}
            <div> {/* Placeholder for potential breadcrumbs or left-aligned header content */}
               <SidebarTrigger className="md:hidden text-foreground" /> {/* Mobile toggle */}
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-card text-foreground hover:bg-muted"> {/* Bell Icon 24x24 in a 32x32 button seems off, making button 32x32. Icon 20x20 */}
                <Bell className="h-5 w-5" /> {/* Icon size */}
                <span className="sr-only">Toggle notifications</span>
              </Button>
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background"> {/* Ensure main area has correct bg */}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full overflow-hidden h-8 w-8"> {/* Avatar 32x32px */}
          <Avatar className="h-full w-full bg-card"> {/* Background Dark for Avatar */}
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
            <AvatarFallback className="bg-card text-foreground">SS</AvatarFallback> {/* Background Dark, Text Light */}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border"/>
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
