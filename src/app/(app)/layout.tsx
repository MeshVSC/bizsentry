
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions'; 
// import { redirect } from 'next/navigation'; // Keep redirect commented for now
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  let debugMessage: string | null = null;

  try {
    currentUser = await getCurrentUser();
    if (currentUser) {
        console.log('[AppLayout Debug] getCurrentUser returned a user object:', JSON.stringify(currentUser));
        debugMessage = `Current User (Debug): ${JSON.stringify(currentUser)}`;
    } else {
        // This case should ideally not be hit if getCurrentUser throws errors instead of returning null
        console.log('[AppLayout Debug] getCurrentUser returned null (and did not throw an error). This is unexpected.');
        debugMessage = "Current User (Debug): null (Unexpected - getCurrentUser did not throw)";
    }
  } catch (error: any) {
    console.error('[AppLayout Debug] Error in getCurrentUser:', error.message);
    debugMessage = `Error fetching user (Debug): ${error.message}`;
    // currentUser remains null
  }

  // Temporarily disable redirect to see the debug message
  // if (!currentUser) {
  //   console.log('[AppLayout Debug] currentUser is null (or error occurred), redirecting to /login. Value was:', JSON.stringify(currentUser), 'Debug Message:', debugMessage); 
  //   // redirect('/login'); // Keep disabled for now
  // }

  return (
    <>
      {debugMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255,0,0,0.7)', color: 'white', padding: '10px', zIndex: 9999, textAlign: 'center', fontSize: '12px' }}>
          {debugMessage}
          {currentUser === null && " (Redirect to /login was TEMPORARILY DISABLED for debugging)"}
        </div>
      )}
      <AppLayout currentUser={currentUser}>
        {children}
        <Toaster />
      </AppLayout>
    </>
  );
}
