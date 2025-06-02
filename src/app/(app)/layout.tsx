
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions'; // Custom getCurrentUser
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const currentUser: CurrentUser | null = await getCurrentUser();

  // TEMPORARY DEBUGGING: Display currentUser value
  let debugCurrentUserDisplay = "Current User (Debug): Error in stringification or currentUser not yet resolved.";
  try {
    if (currentUser === undefined) { // Should not happen with await, but as a safeguard
        debugCurrentUserDisplay = "Current User (Debug): undefined (unexpected)";
    } else if (currentUser === null) {
      debugCurrentUserDisplay = "Current User (Debug): null";
    } else {
      debugCurrentUserDisplay = `Current User (Debug): ${JSON.stringify(currentUser)}`;
    }
  } catch (e: any) {
    debugCurrentUserDisplay = `Current User (Debug): Error stringifying - ${e.message}`;
  }

  // TEMPORARILY COMMENTED OUT FOR DEBUGGING
  // if (!currentUser) {
  //   // If redirecting, we might not see the debug output easily,
  //   // but if it *doesn't* redirect, this debug output will be key.
  //   console.log('[AppLayout Debug] currentUser is null, redirecting to /login. Value was:', currentUser); // Server-side log
  //   redirect('/login');
  // }

  return (
    <AppLayout currentUser={currentUser}>
      {/* TEMPORARY DEBUGGING DISPLAY */}
      <div style={{ position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.85)', color: 'white', padding: '10px', zIndex: 9999, fontSize: '12px', width: '100%', borderBottom: '1px solid red' }}>
        {debugCurrentUserDisplay}
        {!currentUser && " (Redirect to /login was TEMPORARILY DISABLED for debugging)"}
      </div>
      {children}
      <Toaster />
    </AppLayout>
  );
}
