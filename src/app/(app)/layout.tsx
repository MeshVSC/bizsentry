
import type { ReactNode } from 'react';
import React, { cloneElement } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  let layoutDebugMessage = "Layout: Initializing..."; // For debugging within GroupedAppLayout

  try {
    currentUser = await getCurrentUser();
    if (currentUser) {
      layoutDebugMessage = `Layout: currentUser successfully fetched: ${JSON.stringify(currentUser, null, 2)}`;
    } else {
      // This case should ideally be caught by an error from getCurrentUser if cookie is missing
      layoutDebugMessage = "Layout: getCurrentUser() returned null (unexpected without error).";
    }
  } catch (error: any) {
    layoutDebugMessage = `Layout: Error from getCurrentUser(): ${error.message}`;
    // currentUser remains null
  }

  if (!currentUser) {
    // This log might not be visible if redirect happens too fast, but good for server logs
    // console.log(`[GroupedAppLayout] currentUser is null or errored (${layoutDebugMessage}). Redirecting to /login.`);
    redirect('/login');
  }

  // If we reach here, currentUser MUST be populated.
  // This log will confirm its state just before passing to children.
  // console.log(`[GroupedAppLayout] Proceeding to render children. currentUser state:`, currentUser ? JSON.stringify(currentUser) : "null (ERROR IF THIS HAPPENS)");
  // Overwrite layoutDebugMessage for the positive case after redirect check
  layoutDebugMessage = `Layout: User is VALID, passing to children. User: ${JSON.stringify(currentUser, null, 2)}`;


  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore - currentUser is not a known prop for all possible page components initially
      // Page components have been updated to accept this prop.
      return cloneElement(child, { currentUser });
    }
    return child;
  });

  return (
    <>
      {/* Temporary debug display for GroupedAppLayout's currentUser state */}
      <div style={{ position: 'fixed', top: '0', left: '0', right: '0', backgroundColor: 'rgba(255,0,0,0.8)', color: 'white', padding: '5px', zIndex: 9999, fontSize: '10px', textAlign: 'center', borderBottom: '1px solid white' }}>
        DEBUG (GroupedAppLayout): {layoutDebugMessage}
      </div>
      <AppLayout currentUser={currentUser}> {/* Pass to client component AppLayout for UI (e.g. user menu) */}
        {childrenWithProps} {/* Pass to server component children (pages) */}
        <Toaster />
      </AppLayout>
    </>
  );
}
