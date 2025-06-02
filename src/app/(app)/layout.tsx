
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from '@/lib/actions/userActions';
import type { CurrentUser, GetCurrentUserResult } from '@/types/user';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  const authResult: GetCurrentUserResult = await getCurrentUser();
  console.log("[GroupedAppLayout] authResult from getCurrentUser():", JSON.parse(JSON.stringify(authResult || null)));
  
  const currentUserFromAuthResult: CurrentUser | null = authResult.user;
  console.log("[GroupedAppLayout] currentUser derived from authResult:", JSON.parse(JSON.stringify(currentUserFromAuthResult || null)));

  // Rigorous check to ensure currentUser is valid before passing to AuthProvider
  const finalCurrentUserForProvider: CurrentUser | null =
    (currentUserFromAuthResult &&
    typeof currentUserFromAuthResult === 'object' &&
    currentUserFromAuthResult.id &&
    typeof currentUserFromAuthResult.id === 'string' &&
    currentUserFromAuthResult.id.trim() !== "")
      ? currentUserFromAuthResult
      : null;

  console.log("[GroupedAppLayout] finalCurrentUserForProvider (after rigorous check):", JSON.parse(JSON.stringify(finalCurrentUserForProvider || null)));
  
  if (!finalCurrentUserForProvider) {
    console.warn(`[GroupedAppLayout] No valid current user found (finalCurrentUserForProvider is null). Redirecting to login. Debug from getCurrentUser: ${authResult.debugMessage || "No debug message."}`);
    redirect('/login');
  }

  console.log("[GroupedAppLayout] User IS authenticated. Value being passed to AuthProvider:", JSON.parse(JSON.stringify(finalCurrentUserForProvider)));

  return (
    <AuthProvider currentUser={finalCurrentUserForProvider}>
      <AppLayout currentUser={finalCurrentUserForProvider}>
        {children}
        <Toaster />
      </AppLayout>
    </AuthProvider>
  );
}
