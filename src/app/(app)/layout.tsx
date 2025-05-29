
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
import { redirect } from 'next/navigation';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    // If no current user, redirect to the login page.
    // This check protects all routes within the (app) group.
    redirect('/login');
  }

  return (
    <AppLayout currentUser={currentUser}>
      {children}
      <Toaster />
    </AppLayout>
  );
}
