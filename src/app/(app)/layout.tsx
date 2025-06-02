
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
// import { redirect } from 'next/navigation'; // Redirect temporarily disabled
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  let debugMessage = "Layout: Initializing...";

  try {
    currentUser = await getCurrentUser(); // getCurrentUser might throw, or return null if cookie exists but user deleted
    if (currentUser) {
      debugMessage = `Layout: User is VALID, passing to children. User: ${JSON.stringify(currentUser, null, 2)}`;
    } else {
      // This case implies cookie might exist, userId extracted, but Supabase found no user (e.g., deleted user)
      // OR getCurrentUser itself returned null for a reason other than an exception (should be rare with current error throwing)
      debugMessage = "Layout: getCurrentUser() returned null (UNEXPECTED, SHOULD THROW). Would redirect to /login.";
      // redirect('/login'); // TEMPORARILY DISABLED
    }
  } catch (error: any) {
    // This catches errors thrown by getCurrentUser (e.g., cookie not found, Supabase query error)
    debugMessage = `Layout: Error from getCurrentUser(): ${error.message}. Would redirect to /login.`;
    // redirect('/login'); // TEMPORARILY DISABLED
  }

  return (
    <>
      <div style={{ position: 'fixed', top: '0', left: '0', right: '0', backgroundColor: 'rgba(255,0,0,0.8)', color: 'white', padding: '5px', zIndex: 9999, fontSize: '10px', textAlign: 'center', borderBottom: '1px solid white' }}>
        DEBUG (GroupedAppLayout): {debugMessage}
      </div>
      <AppLayout currentUser={currentUser}> {/* Pass object to client component AppLayout */}
        {children}
        <Toaster />
      </AppLayout>
    </>
  );
}

