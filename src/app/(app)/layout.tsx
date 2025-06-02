
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions'; 
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const currentUser: CurrentUser | null = await getCurrentUser();

  let debugCurrentUserDisplay = "Current User (Debug): Error in stringification or currentUser not yet resolved.";
  try {
    if (currentUser === undefined) { 
        debugCurrentUserDisplay = "Current User (Debug): undefined (unexpected)";
    } else if (currentUser === null) {
      debugCurrentUserDisplay = "Current User (Debug): null";
    } else {
      debugCurrentUserDisplay = `Current User (Debug): ${JSON.stringify(currentUser)}`;
    }
  } catch (e: any) {
    debugCurrentUserDisplay = `Current User (Debug): Error stringifying - ${e.message}`;
  }

  // Re-enable the redirect. With mock user, currentUser should not be null.
  if (!currentUser) {
    console.log('[AppLayout Debug] currentUser is null, redirecting to /login. Value was:', currentUser); 
    redirect('/login');
  }

  return (
    <AppLayout currentUser={currentUser}>
      {/* TEMPORARY DEBUGGING DISPLAY - Should show mock user now */}
      <div style={{ position: 'fixed', top: 0, left: 0, background: 'rgba(0,0,0,0.85)', color: 'white', padding: '10px', zIndex: 9999, fontSize: '12px', width: '100%', borderBottom: '1px solid limegreen' }}>
        {debugCurrentUserDisplay}
      </div>
      {children}
      <Toaster />
    </AppLayout>
  );
}
