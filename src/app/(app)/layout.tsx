
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser, type GetCurrentUserResult } from '@/lib/actions/userActions';
import type { CurrentUser } from '@/types/user';
// import { redirect } from 'next/navigation'; // Temporarily disabled

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  let currentUser: CurrentUser | null = null;
  let layoutDebugMessage: string | undefined = "Layout: Initializing...";

  try {
    const result: GetCurrentUserResult = await getCurrentUser();
    currentUser = result.user;
    layoutDebugMessage = result.debugMessage || (currentUser ? `Layout: User is VALID. User: ${JSON.stringify(currentUser)}` : "Layout: getCurrentUser returned null user but no debug message.");

    if (!currentUser) {
      layoutDebugMessage = `Layout: CurrentUser is NULL. Debug from getCurrentUser: ${result.debugMessage || "No specific debug message."}. Would redirect to /login.`;
      // redirect('/login'); // TEMPORARILY DISABLED FOR DEBUGGING
    }
  } catch (error: any) {
    layoutDebugMessage = `Layout: Error in getCurrentUser: ${error.message}. Would redirect to /login.`;
    // redirect('/login'); // TEMPORARILY DISABLED FOR DEBUGGING
  }

  return (
    <>
      {/* Temporary Debug Bar for Layout */}
      <div style={{ backgroundColor: 'red', color: 'white', padding: '5px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10000, fontSize:'0.8rem' }}>
        DEBUG (GroupedAppLayout): {layoutDebugMessage}
      </div>
      <AppLayout currentUser={currentUser}>
        {children}
        <Toaster />
      </AppLayout>
    </>
  );
}
