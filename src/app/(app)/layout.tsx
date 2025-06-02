
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
  
  const currentUser: CurrentUser | null = authResult.user;
  console.log("[GroupedAppLayout] currentUser derived from authResult:", JSON.parse(JSON.stringify(currentUser || null)));

  if (!currentUser?.id) {
    console.warn(`[GroupedAppLayout] No valid current user found (currentUser is null, or lacks an id). currentUser value: ${JSON.stringify(currentUser)}. Redirecting to login. Debug from getCurrentUser: ${authResult.debugMessage || "No debug message."}`);
    redirect('/login');
  }

  console.log("[GroupedAppLayout] User IS authenticated. Value being passed to AuthProvider:", JSON.parse(JSON.stringify(currentUser)));

  return (
    <AuthProvider currentUser={currentUser}>
      <AppLayout currentUser={currentUser}>
        {children}
        <Toaster />
      </AppLayout>
    </AuthProvider>
  );
}
