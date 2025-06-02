
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
import type { CurrentUser, GetCurrentUserResult } from '@/types/user';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const authResult: GetCurrentUserResult = await getCurrentUser();
  const currentUser: CurrentUser | null = authResult.user;

  // console.log(`[GroupedAppLayout] authResult from getCurrentUser():`, JSON.parse(JSON.stringify(authResult || null)));
  // console.log(`[GroupedAppLayout] currentUser extracted:`, JSON.parse(JSON.stringify(currentUser || null)));

  // Refined check: Ensure currentUser exists AND has an id.
  // An empty object {} is truthy but currentUser.id would be undefined.
  if (!currentUser?.id) {
    // console.warn(`[GroupedAppLayout] No valid current user found (currentUser is null, or lacks an id). Redirecting to login. Debug from getCurrentUser: ${authResult.debugMessage || "No debug message."}`);
    redirect('/login');
    // return null; // Should be unreachable due to redirect
  }

  // If we reach here, currentUser is a valid CurrentUser object with an id.
  // console.log(`[GroupedAppLayout] User IS authenticated. currentUser being passed to AuthProvider:`, JSON.parse(JSON.stringify(currentUser)));

  return (
    <AuthProvider currentUser={currentUser}>
      <AppLayout currentUser={currentUser}>
        {children}
        <Toaster />
      </AppLayout>
    </AuthProvider>
  );
}
