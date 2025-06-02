
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions'; 
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const currentUser: CurrentUser | null = await getCurrentUser();

  // Re-enable the redirect. With mock user, currentUser should not be null.
  if (!currentUser) {
    // console.log('[AppLayout Debug] currentUser is null, redirecting to /login. Value was:', currentUser); 
    redirect('/login');
  }

  return (
    <AppLayout currentUser={currentUser}>
      {children}
      <Toaster />
    </AppLayout>
  );
}

