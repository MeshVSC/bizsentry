
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
// getCurrentUser and AuthProvider related imports are removed

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  // Authentication is removed. No user fetching or AuthProvider needed.
  // console.log("[GroupedAppLayout] Authentication removed. Rendering without user context.");

  return (
    // <AuthProvider currentUser={null}> Removed AuthProvider
    <AppLayout> {/* AppLayout no longer expects currentUser prop */}
      {children}
      <Toaster />
    </AppLayout>
    // </AuthProvider>
  );
}
