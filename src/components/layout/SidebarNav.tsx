
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, BarChart3, Settings } from 'lucide-react'; // Changed Edit3 to Settings
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings/options', label: 'Settings', icon: Settings }, // Changed label and icon
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        // More specific active check for settings to ensure only /settings/options is active for "Settings"
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
                  isActive && "bg-primary/30 text-primary" // Active State: background Primary at 30% opacity, text Primary
                )}
              >
                <a> {/* <a> tag is required when asChild is true with Link */}
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
