
"use client"; 

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Plus } from 'lucide-react';
import SidebarNav from './SidebarNav';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}


function AppLayoutContent({ children }: AppLayoutProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();
  
  const SIDEBAR_WIDTH = "240px";
  const SIDEBAR_WIDTH_ICON = "64px";

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Get page title and description based on pathname
  const getPageInfo = () => {
    if (pathname === '/dashboard') return { title: 'Dashboard', description: 'Overview of your inventory performance' };
    if (pathname === '/inventory') return { title: 'Inventory', description: 'Manage your inventory items' };
    if (pathname === '/inventory/add') return { title: 'Add New Item', description: 'Create a new inventory item' };
    if (pathname.startsWith('/inventory/') && pathname.endsWith('/edit')) return { title: 'Edit Item', description: 'Update inventory item details' };
    if (pathname.startsWith('/inventory/')) return { title: 'Item Details', description: 'View inventory item information' };
    if (pathname === '/analytics') return { title: 'Analytics', description: 'Inventory insights and reports' };
    if (pathname.startsWith('/settings')) return { title: 'Settings', description: 'Application configuration' };
    return { title: 'BizSentry', description: 'Inventory management system' };
  };

  const { title } = getPageInfo();

  return (
    <>
      {/* TOCK-Style Sidebar */}
      <Sidebar
        variant="sidebar"
        collapsible="icon" 
        className={cn(
          "flex flex-col bg-[#080808] border-r border-[#1f1f1f] text-foreground fixed left-0 top-0 h-screen z-50",
          isMobile && "transform transition-transform duration-300",
          isMobile && state === "collapsed" && "-translate-x-full"
        )}
        style={{ width: isMobile ? "280px" : (isCollapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH) }}
      >
        {/* Logo Section */}
        <SidebarHeader className="p-5">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div 
              className="logo-icon w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold hover:scale-105 transition-transform"
              style={{
                background: 'rgba(255, 159, 67, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 159, 67, 0.2)',
                boxShadow: '0 0 15px rgba(255, 159, 67, 0.3)',
                color: '#ff9f43',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              B
            </div>
            {!isCollapsed && (
              <div className="gradient-text">
                <h1 className="text-base font-semibold">BIZ</h1>
                <p className="text-[10px] text-muted-foreground">SENTRY</p>
              </div>
            )}
          </Link>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="p-4 flex-grow">
          <SidebarNav />
        </SidebarContent>
        
        {/* Profile Section */}
        <div className="p-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-btn rounded-full flex items-center justify-center text-xs font-bold text-white">
              MC
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h3 className="text-sm font-medium">MeshCode</h3>
                <p className="text-[10px] text-muted-foreground">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </Sidebar>

      {/* Main Content Area */}
      <div 
        style={{
          marginLeft: isMobile ? "0" : (isCollapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH),
        }}
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          isMobile && "w-full"
        )}
      >
        {/* TOCK-Style Header */}
        <header className="sticky top-0 z-30 h-16 md:h-20 border-b border-[#1f1f1f] bg-[#080808]/80 backdrop-blur-3xl">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="text-foreground hover:bg-[#111111] p-2 rounded" />
              <div>
                <h1 className="text-lg md:text-xl font-bold truncate">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 bg-[#111111] hover:bg-[#191919] text-muted-foreground hidden sm:flex"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Link 
                href="/inventory/add"
                className="glass-btn px-2 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:scale-105 transition-transform flex items-center"
                style={{
                  background: 'rgba(255, 159, 67, 0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 159, 67, 0.3)',
                  color: '#ff9f43',
                  boxShadow: '0 4px 16px rgba(255, 159, 67, 0.2)'
                }}
              >
                <Plus className="h-4 w-4 md:mr-1" />
                <span className="hidden sm:inline">Add New Item</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-[#000000]">
          {children}
        </main>

        {/* TOCK-Style Floating Action Button - Mobile Only */}
        <Link 
          href="/inventory/add"
          className="sm:hidden fixed bottom-4 right-4 w-14 h-14 glass-btn rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-40"
        >
          <Plus className="h-6 w-6" />
        </Link>
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
