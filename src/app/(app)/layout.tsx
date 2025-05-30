
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions'; // Custom getCurrentUser
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const currentUser: CurrentUser | null = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <AppLayout currentUser={currentUser}> {/* Pass currentUser to AppLayout */}
      {children}
      <Toaster />
    </AppLayout>
  );
}
