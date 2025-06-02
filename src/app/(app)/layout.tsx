
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
import type { CurrentUser } from '@/types/user';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const currentUser: CurrentUser | null = await getCurrentUser();

  if (!currentUser) {
    // This is the primary server-side auth guard.
    // If getCurrentUser returns null (e.g. cookie not found, invalid, or user not in DB),
    // redirect to login.
    redirect('/login');
    // return null; // Should be unreachable due to redirect
  }

  return (
    <AuthProvider currentUser={currentUser}>
      <AppLayout currentUser={currentUser}>
        {children}
        <Toaster />
      </AppLayout>
    </AuthProvider>
  );
}
