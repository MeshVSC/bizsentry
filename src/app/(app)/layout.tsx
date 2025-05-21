
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";

export default function GroupedAppLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout>
      {children}
      <Toaster />
    </AppLayout>
  );
}
