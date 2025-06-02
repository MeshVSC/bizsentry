
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
import type { CurrentUser } from '@/types/user';
import { redirect } from 'next/navigation'; 

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  
  try {
    currentUser = await getCurrentUser(); // This call will be cached if React.cache works as expected
    if (!currentUser) {
      // This should ideally not be reached if getCurrentUser throws an error on cookie/user not found
      // but as a safeguard:
      redirect('/login'); 
    }
  } catch (error: any) {
    // If getCurrentUser throws (e.g., SESSION_COOKIE_NOT_FOUND_OBJECT), redirect.
    redirect('/login');
  }

  return (
    <>
      {/* Removed the red debug bar */}
      <AppLayout currentUser={currentUser}> {/* Client AppLayout for UI elements */}
        {children} {/* Pages will call getCurrentUser() themselves, which should hit the cache */}
        <Toaster />
      </AppLayout>
    </>
  );
}
