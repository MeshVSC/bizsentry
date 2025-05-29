
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
// Removed: getCurrentUser and redirect from 'next/navigation' as auth is handled client-side in AppLayout

export default function GroupedAppLayout({ children }: { children: ReactNode }) {
  // Authentication check is now primarily handled client-side within AppLayout using Supabase
  return (
    <AppLayout>
      {children}
      <Toaster />
    </AppLayout>
  );
}
