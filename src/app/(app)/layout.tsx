
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions'; // Custom getCurrentUser
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const currentUser: CurrentUser | null = await getCurrentUser();

  // TEMPORARY DEBUGGING: Display currentUser value
  let debugCurrentUserDisplay = "Current User (Debug): Not available or error in stringification.";
  try {
    if (currentUser === null) {
      debugCurrentUserDisplay = "Current User (Debug): null";
    } else {
      debugCurrentUserDisplay = `Current User (Debug): ${JSON.stringify(currentUser)}`;
    }
  } catch (e) {
    // Error during stringification, keep default message
  }

  if (!currentUser) {
    // If redirecting, we might not see the debug output easily,
    // but if it *doesn't* redirect, this debug output will be key.
    // Forcing a display before redirect might require more complex changes,
    // but if getCurrentUser() *does* return something, we'll see it.
    console.log('[AppLayout Debug] currentUser is null, redirecting to /login. Value was:', currentUser); // Server-side log
    redirect('/login');
  }

  return (
    <AppLayout currentUser={currentUser}>
      {/* TEMPORARY DEBUGGING DISPLAY - REMOVE AFTER FIX */}
      <div style={{ position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', zIndex: 9999, fontSize: '12px', width: '100%' }}>
        {debugCurrentUserDisplay}
        {currentUser === null && " (Redirecting to /login because currentUser is null)"}
      </div>
      {children}
      <Toaster />
    </AppLayout>
  );
}
