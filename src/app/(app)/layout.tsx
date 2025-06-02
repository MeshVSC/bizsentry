
import type { ReactNode } from 'react';
// Removed React.cloneElement as it's no longer used for prop drilling to pages
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  let debugMessage = "Layout: Initializing...";

  try {
    currentUser = await getCurrentUser(); // This call should be cached by React.cache
    if (currentUser) {
      debugMessage = `Layout: User is VALID. User: ${JSON.stringify(currentUser, null, 2)}`;
    } else {
      // This case should ideally not be reached if getCurrentUser throws on "not found"
      debugMessage = "Layout: getCurrentUser() returned null (unexpected). Redirecting.";
      redirect('/login');
    }
  } catch (error: any) {
    debugMessage = `Layout: Error from getCurrentUser(): ${error.message}. Redirecting.`;
    // console.error('[GroupedAppLayout] Error in getCurrentUser, redirecting:', error.message);
    redirect('/login');
  }

  // If we reach here, currentUser MUST be populated due to the redirect logic above.
  // No longer cloning children with props; pages will call getCurrentUser() themselves.

  return (
    <>
      <div style={{ position: 'fixed', top: '0', left: '0', right: '0', backgroundColor: 'rgba(255,0,0,0.8)', color: 'white', padding: '5px', zIndex: 9999, fontSize: '10px', textAlign: 'center', borderBottom: '1px solid white' }}>
        DEBUG (GroupedAppLayout): {debugMessage}
      </div>
      <AppLayout currentUser={currentUser}> {/* Pass object to client component AppLayout */}
        {children} {/* Render children directly */}
        <Toaster />
      </AppLayout>
    </>
  );
}
