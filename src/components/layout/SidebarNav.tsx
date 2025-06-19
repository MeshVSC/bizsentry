"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, BarChart3, Settings, SlidersHorizontal, List, Palette, type LucideIcon } from 'lucide-react';
// Users icon removed as User Management is gone
import { useSidebar } from '@/components/ui/sidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matcher?: RegExp;
}

interface AccordionNavItem {
  label: string;
  icon: LucideIcon;
  matcher?: RegExp;
  children: NavItem[];
  id: string; // for AccordionItem value
}

const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, matcher: /^\/dashboard$/ },
  { href: '/inventory', label: 'Inventory', icon: Package, matcher: /^\/inventory(\/.*)?$/ },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, matcher: /^\/analytics$/ },
];

// User Management link removed from settingsSubNavItems
const settingsSubNavItems: NavItem[] = [
  { href: '/settings/application', label: 'Application', icon: SlidersHorizontal, matcher: /^\/settings\/application$/ },
  { href: '/settings/glass-preview', label: 'Theme Preview', icon: Palette, matcher: /^\/settings\/glass-preview$/ },
  { href: '/settings/master-lists', label: 'Master Lists', icon: List, matcher: /^\/settings\/master-lists$/ },
  // { href: '/settings/users', label: 'User Management', icon: Users, matcher: /^\/settings\/users$/ }, // Removed
];

const settingsAccordionItem: AccordionNavItem = {
  id: 'settings-accordion',
  label: 'Settings',
  icon: Settings,
  matcher: /^\/settings(\/.*)?$/,
  children: settingsSubNavItems,
};

export default function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();

  const isSettingsActive = settingsAccordionItem.matcher?.test(pathname);
  const isSettingsSection = pathname.startsWith('/settings');
  const defaultAccordionValue = isSettingsSection ? settingsAccordionItem.id : undefined;

  return (
    <div className="space-y-1">
      {/* Main Navigation - TOCK Style */}
      {mainNavItems.map((item) => {
        const isActive = item.matcher ? item.matcher.test(pathname) : (pathname === item.href);
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={cn(
              "flex items-center px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
              "text-muted-foreground hover:bg-[#111111] hover:text-foreground",
              isActive && "bg-[#ff9f43]/15 text-foreground border-l-3 border-[#ff9f43] shadow-[0_0_15px_rgba(255,159,67,0.2)]"
            )}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {sidebarState !== 'collapsed' && <span>{item.label}</span>}
          </Link>
        );
      })}

      {/* Settings Section */}
      <div className="mt-6">
        <Accordion type="single" collapsible defaultValue={defaultAccordionValue} className="w-full">
          <AccordionItem value={settingsAccordionItem.id} className="border-b-0">
            <AccordionTrigger className={cn(
              "flex items-center px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:no-underline [&>svg.lucide-chevron-down]:ml-auto",
              "text-muted-foreground hover:bg-[#111111] hover:text-foreground",
              isSettingsActive && "bg-[#ff9f43]/15 text-foreground shadow-[0_0_10px_rgba(255,159,67,0.15)]"
            )}>
              <settingsAccordionItem.icon className="h-4 w-4 mr-2" />
              {sidebarState !== 'collapsed' && <span>{settingsAccordionItem.label}</span>}
            </AccordionTrigger>
            
            <AccordionContent className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              {sidebarState !== 'collapsed' && (
                <div className="pl-4 space-y-1">
                  {settingsAccordionItem.children.map((subItem) => {
                    const isSubActive = subItem.matcher ? subItem.matcher.test(pathname) : (pathname === subItem.href);
                    return (
                      <Link 
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer",
                          "text-muted-foreground hover:bg-[#111111] hover:text-foreground",
                          isSubActive && "bg-[#ff9f43]/10 text-foreground shadow-[0_0_8px_rgba(255,159,67,0.1)]"
                        )}
                      >
                        <subItem.icon className="h-3 w-3 mr-2" />
                        <span>{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
