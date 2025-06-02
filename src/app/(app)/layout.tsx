
import type { ReactNode } from 'react';
import React, { cloneElement } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions'; 
import { redirect } from 'next/navigation';
import type { CurrentUser } from '@/types/user';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  
  try {
    currentUser = await getCurrentUser();
  } catch (error: any) {
    // If getCurrentUser throws (e.g. cookie not found, Supabase error),
    // it means user is not authenticated or session is invalid.
    // Redirect to login. The specific error message isn't shown to user here,
    // but it would have been logged by getCurrentUser itself if console logs were active.
    redirect('/login'); 
  }

  // If try-catch block was successfully completed and currentUser is still null 
  // (though getCurrentUser is designed to throw an error now instead of returning null directly for auth failures),
  // also redirect. This is a defensive check.
  if (!currentUser) {
    redirect('/login');
  }

  // Pass currentUser to the child page component (which are Server Components)
  // And also to the AppLayout client component for its UI elements (e.g., user menu)
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore - currentUser is not a known prop for all possible page components initially
      // Page components will need to be updated to accept this prop.
      return cloneElement(child, { currentUser });
    }
    return child;
  });

  return (
    <>
      <AppLayout currentUser={currentUser}>
        {childrenWithProps}
        <Toaster />
      </AppLayout>
    </>
  );
}
