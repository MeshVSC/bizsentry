
import type { ReactNode } from 'react';
import React from 'react'; // Ensure React is imported for cloneElement
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
import type { CurrentUser } from '@/types/user';
// import { redirect } from 'next/navigation'; // TEMPORARILY DISABLED

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  let debugMessage = "Layout: Initializing...";

  try {
    currentUser = await getCurrentUser();
    if (currentUser) {
      debugMessage = `Layout: User is VALID, passing to children. User: ${JSON.stringify(currentUser, null, 2)}`;
    } else {
      debugMessage = "Layout: getCurrentUser() returned null (UNEXPECTED, SHOULD THROW). Would redirect to /login.";
      // TEMPORARILY DISABLED: redirect('/login'); 
    }
  } catch (error: any) {
    debugMessage = `Layout: Error fetching user (Debug): ${error.message}`;
    // TEMPORARILY DISABLED: redirect('/login');
  }

  // Attempt to pass currentUser to children using React.cloneElement
  // This may not work reliably with Server Component children in all environments.
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore // currentUser might not be a declared prop on all children initially
      return React.cloneElement(child, { currentUser });
    }
    return child;
  });

  return (
    <>
      <div style={{ position: 'fixed', top: '0', left: '0', right: '0', backgroundColor: 'rgba(255,0,0,0.8)', color: 'white', padding: '5px', zIndex: 9999, fontSize: '10px', textAlign: 'center', borderBottom: '1px solid white' }}>
        DEBUG (GroupedAppLayout): {debugMessage}
      </div>
      <AppLayout currentUser={currentUser}> {/* Client AppLayout for UI elements */}
        {childrenWithProps} {/* Render children (pages) which should now have currentUser prop */}
        <Toaster />
      </AppLayout>
    </>
  );
}
