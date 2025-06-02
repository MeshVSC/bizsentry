
import type { ReactNode } from 'react';
import React, { cloneElement } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  let layoutDebugMessage = "Layout: Initializing..."; 

  try {
    currentUser = await getCurrentUser();
    if (currentUser) {
      layoutDebugMessage = `Layout: User is VALID, passing to children. User: ${JSON.stringify(currentUser, null, 2)}`;
    } else {
      // This case should be caught by an error from getCurrentUser if cookie is missing/invalid
      layoutDebugMessage = "Layout: getCurrentUser() returned null AND did not throw an error (unexpected). Redirecting.";
      redirect('/login');
    }
  } catch (error: any) {
    layoutDebugMessage = `Layout: Error from getCurrentUser(): ${error.message}. Redirecting.`;
    // console.error('[GroupedAppLayout] Error in getCurrentUser, redirecting:', error.message);
    redirect('/login');
  }

  // If we reach here, currentUser MUST be populated.
  const currentUserJson = JSON.stringify(currentUser);

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore - currentUserJson and currentUser are not known props for all possible page components initially
      // Page components need to be updated to accept this.
      return cloneElement(child, { currentUserJson, currentUser }); // Pass both for now, page will use currentUserJson
    }
    return child;
  });

  return (
    <>
      <div style={{ position: 'fixed', top: '0', left: '0', right: '0', backgroundColor: 'rgba(255,0,0,0.8)', color: 'white', padding: '5px', zIndex: 9999, fontSize: '10px', textAlign: 'center', borderBottom: '1px solid white' }}>
        DEBUG (GroupedAppLayout): {layoutDebugMessage}
      </div>
      <AppLayout currentUser={currentUser}> {/* Pass object to client component AppLayout */}
        {childrenWithProps} {/* Pass JSON string (and object for other pages) to server component children */}
        <Toaster />
      </AppLayout>
    </>
  );
}
