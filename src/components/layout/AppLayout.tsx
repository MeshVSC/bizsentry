
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Settings, LifeBuoy, LogOut } from 'lucide-react';
import SidebarNav from './SidebarNav';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CurrentUser } from '@/types/user';
import { logoutUser } from '@/lib/actions/userActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';

interface AppLayoutProps {
  children: ReactNode;
  currentUser: CurrentUser | null;
}

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
      <div className="flex min-h-screen w-full bg-background group/sidebar-wrapper" data-sidebar-state="expanded">
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="flex flex-col text-sidebar-foreground bg-sidebar-DEFAULT border-r border-sidebar-border"
        >
          <SidebarHeader className="p-4 h-16 flex items-center justify-between border-b border-sidebar-border">
            {/* Content for expanded header - Intentionally empty as logo is lower */}
            <div className="w-full group-data-[sidebar-state=collapsed]/sidebar-wrapper:hidden">
            </div>
            {/* Content for collapsed header - Icon Logo */}
            <div className="w-full hidden group-data-[sidebar-state=collapsed]/sidebar-wrapper:flex items-center justify-center">
              <Link href="/dashboard">
                <Image
                  src="/logo-icon.png"
                  alt="StockSentry Icon"
                  width={500}
                  height={500}
                  className="h-7 w-7"
                  data-ai-hint="logo abstract"
                />
              </Link>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 flex-grow">
            <SidebarNav />
          </SidebarContent>

          {/* Logo Section - Placed above the footer */}
          {/* Expanded Logo: Image */}
          <div className="px-4 pb-2 pt-4 group-data-[sidebar-state=collapsed]/sidebar-wrapper:hidden">
            <Link href="/dashboard" className="block">
              <Image
                src="/logo.png"
                alt="StockSentry Logo"
                width={1024}
                height={1024}
                className="h-10 w-auto" 
                data-ai-hint="logo modern"
              />
            </Link>
          </div>
          
          {/* Collapsed Logo - Handled by SidebarHeader */}

          <SidebarFooter className="p-4 pt-2 border-t border-sidebar-border group-data-[sidebar-state=collapsed]/sidebar-wrapper:hidden">
            <p className="text-xs text-muted-foreground text-left w-full">
              Version {appVersion}
            </p>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 ml-[var(--sidebar-width)] group-data-[sidebar-state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)] transition-all duration-300 ease-in-out">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-6">
            <div>
               <SidebarTrigger className="text-foreground" />
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
          <Link href="/settings/application" className="flex items-center w-full cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled> {/* Disabled as it's not implemented */}
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border"/>
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
