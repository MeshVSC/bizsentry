
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, BarChart3, Settings, Users, SlidersHorizontal, ListFilter, Archive as StorageIcon, MapPin as BinIcon, Building as RoomIcon, Briefcase as VendorIcon, Construction as ProjectIcon, type LucideIcon } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
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

const settingsSubNavItems: NavItem[] = [
  { href: '/settings/application', label: 'Application', icon: SlidersHorizontal, matcher: /^\/settings\/application$/ },
  { href: '/settings/users', label: 'User Management', icon: Users, matcher: /^\/settings\/users$/ },
  { href: '/settings/categories', label: 'Categories', icon: ListFilter, matcher: /^\/settings\/categories$/ },
  { href: '/settings/subcategories', label: 'Subcategories', icon: ListFilter, matcher: /^\/settings\/subcategories$/ },
  { href: '/settings/storage-locations', label: 'Storage', icon: StorageIcon, matcher: /^\/settings\/storage-locations$/ },
  { href: '/settings/bin-locations', label: 'Bin Locations', icon: BinIcon, matcher: /^\/settings\/bin-locations$/ },
  { href: '/settings/rooms', label: 'Rooms', icon: RoomIcon, matcher: /^\/settings\/rooms$/ },
  { href: '/settings/vendors', label: 'Vendors', icon: VendorIcon, matcher: /^\/settings\/vendors$/ },
  { href: '/settings/projects', label: 'Projects', icon: ProjectIcon, matcher: /^\/settings\/projects$/ },
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
    <SidebarMenu>
      {mainNavItems.map((item) => {
        const isActive = item.matcher ? item.matcher.test(pathname) : (pathname === item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: item.label }}
                className={cn(
                  "justify-start text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover",
                  isActive && "bg-primary/30 text-primary"
                )}
              >
                <a>
                  <item.icon className="h-5 w-5" />
                  <span className={cn(sidebarState === 'collapsed' && "group-data-[state=collapsed]:hidden")}>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}

      <Accordion type="single" collapsible defaultValue={defaultAccordionValue} className="w-full">
        <AccordionItem value={settingsAccordionItem.id} className="border-b-0">
           <SidebarMenuButton 
             asChild 
             isActive={isSettingsActive}
             className={cn(
                "justify-start text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover w-full",
                isSettingsActive && "bg-primary/30 text-primary"
              )}
              tooltip={{children: settingsAccordionItem.label}}
           >
            <AccordionTrigger className="p-2 hover:no-underline [&[data-state=open]>svg]:text-primary [&>svg.lucide-chevron-down]:ml-auto">
                <settingsAccordionItem.icon className="h-5 w-5" />
                <span className={cn("ml-2", sidebarState === 'collapsed' && "group-data-[state=collapsed]:hidden")}>{settingsAccordionItem.label}</span>
                {/* Chevron is part of AccordionTrigger */}
            </AccordionTrigger>
          </SidebarMenuButton>
          <AccordionContent className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className={cn("pl-4 pt-1", sidebarState === 'collapsed' && "group-data-[state=collapsed]:hidden")}>
              {settingsAccordionItem.children.map((subItem) => {
                const isSubActive = subItem.matcher ? subItem.matcher.test(pathname) : (pathname === subItem.href);
                return (
                  <SidebarMenuItem key={subItem.href} className="py-0.5">
                    <Link href={subItem.href} passHref legacyBehavior>
                      <SidebarMenuButton
                        asChild
                        isActive={isSubActive}
                        tooltip={{ children: subItem.label }}
                        className={cn(
                          "justify-start text-xs font-medium text-sidebar-foreground hover:bg-sidebar-hover w-full h-8",
                           isSubActive && "bg-primary/30 text-primary"
                        )}
                      >
                        <a>
                          <subItem.icon className="h-4 w-4" />
                          <span className={cn(sidebarState === 'collapsed' && "group-data-[state=collapsed]:hidden")}>{subItem.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </SidebarMenu>
  );
}
