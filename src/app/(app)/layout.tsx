
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions'; 
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  let errorFetchingUser: string | null = null;

  try {
    currentUser = await getCurrentUser();
    // Server-side console log (not directly visible in Studio UI, but good for completeness)
    if (currentUser) {
        // console.log('[AppLayout Server Log] getCurrentUser returned a user object:', JSON.stringify(currentUser));
    } else {
        // console.log('[AppLayout Server Log] getCurrentUser returned null (and did not throw an error). This is unexpected if an error should have been thrown.');
    }
  } catch (error: any) {
    // console.error('[AppLayout Server Log] Error in getCurrentUser:', error.message);
    errorFetchingUser = error.message; // Store the error message
    // currentUser remains null
  }

  if (!currentUser) {
    // If there was an error fetching the user (like cookie not found),
    // or if currentUser is simply null without an error (less likely with current getCurrentUser logic),
    // redirect to login.
    // console.log(`[AppLayout Server Log] No currentUser (or error: ${errorFetchingUser}), redirecting to /login.`);
    redirect('/login'); 
  }

  return (
    <>
      {/* The debug div has been removed */}
      <AppLayout currentUser={currentUser}>
        {children}
        <Toaster />
      </AppLayout>
    </>
  );
}
