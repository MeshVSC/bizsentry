
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions'; 
import type { CurrentUser, GetCurrentUserResult } from '@/types/user'; 
// import { redirect } from 'next/navigation'; // No longer redirecting when auth is paused
import { AuthProvider } from '@/contexts/AuthContext';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const authResult: GetCurrentUserResult = await getCurrentUser();
  // When auth is paused, authResult.user will be null.
  const currentUserFromAuthResult: CurrentUser | null = authResult.user;

  // This explicit check ensures `finalCurrentUserForProvider` is truly null if `currentUserFromAuthResult` is null or invalid.
  const finalCurrentUserForProvider: CurrentUser | null = 
    (currentUserFromAuthResult && 
     typeof currentUserFromAuthResult === 'object' && 
     currentUserFromAuthResult.id && 
     typeof currentUserFromAuthResult.id === 'string' && 
     currentUserFromAuthResult.id.trim() !== "") 
    ? currentUserFromAuthResult 
    : null;
  
  // Redirect logic is REMOVED when authentication is paused.
  // if (!finalCurrentUserForProvider) {
  //   console.warn(`[GroupedAppLayout] No valid current user (finalCurrentUserForProvider is null). Redirecting to login. Debug from getCurrentUser: ${authResult.debugMessage || "No debug message."}`);
  //   redirect('/login');
  // }

  // console.log("[GroupedAppLayout] Value being passed to AuthProvider (will be null if auth paused):", JSON.parse(JSON.stringify(finalCurrentUserForProvider || null)));

  return (
    <AuthProvider currentUser={finalCurrentUserForProvider}> {/* Will pass null when auth is paused */}
      <AppLayout currentUser={finalCurrentUserForProvider}> {/* AppLayout needs to handle currentUser being null */}
        {children}
        <Toaster />
      </AppLayout>
    </AuthProvider>
  );
}
