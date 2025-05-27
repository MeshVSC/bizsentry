
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, BarChart3, Settings } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings/options', label: 'Settings', icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar(); // Get sidebar state from context

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = item.href === '/settings/options' 
          ? pathname === item.href 
          : (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/'));
        
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{children: item.label}}
                className={cn(
                  "justify-start text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover",
                  isActive && "bg-primary/30 text-primary" 
                )}
              >
                <a> {/* <a> tag is required when asChild is true with Link */}
                  <item.icon className="h-5 w-5" />
                  {sidebarState === 'expanded' && (
                    <span>{item.label}</span>
                  )}
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
