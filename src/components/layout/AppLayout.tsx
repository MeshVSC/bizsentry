
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
// Separator is not needed here anymore if SidebarFooter's border-t is the separator

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
  const appVersion = "0.1.0"; // PRD: version stamp at bottom

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background"> {/* PRD: screen background Background Darker */}
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="fixed h-full flex flex-col w-[var(--sidebar-width)] border-r border-sidebar-border text-sidebar-foreground bg-sidebar" // PRD: width 256px, background Background Darker
        >
          <SidebarHeader className="p-4 h-16 flex items-center justify-center border-b border-sidebar-border"> {/* PRD: Logo padding 24px - adjusted via p-4 */}
            {/* Collapsed state icon for header */}
             <div className="w-full hidden group-data-[collapsible=icon]:flex items-center justify-center">
                <span className="text-xl font-bold text-primary uppercase">SS</span> {/* Simple "SS" for collapsed logo */}
            </div>
             {/* Expanded state header can be empty if logo is at bottom, or show something else */}
             <div className="w-full group-data-[collapsible=icon]:hidden">
                {/* Intentionally empty or minimal if main logo is at bottom */}
             </div>
          </SidebarHeader>

          <SidebarContent className="p-2 flex-grow"> {/* flex-grow will push the logo and footer down */}
            <SidebarNav />
          </SidebarContent>

          {/* "STOCK SENTRY" Logo block - placed after content, so it's at the bottom */}
          <div className="p-4 group-data-[collapsible=icon]:hidden"> {/* Hidden when collapsed */}
            <Link href="/dashboard" className="block"> {/* Removed mb-2 for tighter spacing with footer border */}
              <h1 className="text-2xl font-bold text-primary uppercase leading-tight text-left">
                <span className="block">STOCK</span>
                <span className="block">SENTRY</span>
              </h1>
            </Link>
          </div>
          
          {/* SidebarFooter will contain only the version number. Its top border acts as the separator. */}
          <SidebarFooter className="p-4 pt-2 group-data-[collapsible=icon]:hidden"> {/* PRD: font-size xs, color Text Mid. Default border-t from SidebarFooter style */}
            <p className="text-xs text-muted-foreground text-left w-full">
              Version {appVersion}
            </p>
          </SidebarFooter>

           {/* Placeholder for collapsed footer state if needed */}
           <div className="w-full hidden group-data-[collapsible=icon]:flex items-center justify-center py-2 border-t border-sidebar-border">
               {/* Could be an icon or very short text if needed for collapsed footer */}
           </div>
        </Sidebar>

        <div className="flex flex-col flex-1 ml-[var(--sidebar-width)] group-data-[sidebar-state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)] transition-all duration-300 ease-in-out">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-6"> {/* PRD: Header height 64px */}
            <div>
               <SidebarTrigger className="md:hidden text-foreground" />
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {/* PRD: Bell icon placeholder — 24×24px, background Background Dark circle */}
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-card text-foreground hover:bg-muted">
                <Bell className="h-5 w-5" /> {/* Icon size approx 20px, button is 32px */}
                <span className="sr-only">Toggle notifications</span>
              </Button>
              {/* PRD: Avatar placeholder — 32×32px circle, background Background Dark */}
              <UserMenu currentUser={currentUser} />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background"> {/* Main content background is --background (Background Darker) */}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


function UserMenu({ currentUser }: { currentUser: CurrentUser | null }) {
  const fallback = currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : "SP"; // Updated fallback
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full overflow-hidden h-8 w-8"> {/* PRD: Avatar 32x32px */}
          <Avatar className="h-full w-full bg-card"> {/* PRD: background Background Dark */}
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
