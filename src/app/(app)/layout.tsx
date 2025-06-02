
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
// import { getCurrentUser } from '@/lib/actions/userActions'; // No longer calling this here
import type { CurrentUser } from '@/types/user'; // GetCurrentUserResult no longer needed here
// import { redirect } from 'next/navigation'; // No longer redirecting from here
import { AuthProvider } from '@/contexts/AuthContext';

// Define the mock user directly in the layout or import from a shared constant if preferred
const MOCK_USER_FOR_LAYOUT: CurrentUser = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // VALID UUID
  username: 'MockAdmin',
  role: 'admin',
};

export default async function GroupedAppLayout({ children }: { children: ReactNode }) {
  // const authResult: GetCurrentUserResult = await getCurrentUser(); // REMOVED
  // console.log("[GroupedAppLayout] authResult from getCurrentUser():", JSON.parse(JSON.stringify(authResult || null)));
  
  // const currentUserFromAuthResult: CurrentUser | null = authResult.user; // REMOVED
  // console.log("[GroupedAppLayout] currentUser derived from authResult:", JSON.parse(JSON.stringify(currentUserFromAuthResult || null)));

  // Use the mock user directly
  const finalCurrentUserForProvider: CurrentUser | null = MOCK_USER_FOR_LAYOUT;

  // console.log("[GroupedAppLayout] finalCurrentUserForProvider (after rigorous check):", JSON.parse(JSON.stringify(finalCurrentUserForProvider || null)));
  
  // REMOVED: Redirect logic, as auth is disabled and we always have a mock user
  // if (!finalCurrentUserForProvider || !finalCurrentUserForProvider.id || typeof finalCurrentUserForProvider.id !== 'string' || finalCurrentUserForProvider.id.trim() === "") {
  //   console.warn(`[GroupedAppLayout] No valid current user found (finalCurrentUserForProvider is null or invalid). Redirecting to login. Debug from getCurrentUser: ${authResult.debugMessage || "No debug message."}`);
  //   redirect('/login');
  // }

  // console.log("[GroupedAppLayout] User IS authenticated (or mocked). Value being passed to AuthProvider:", JSON.parse(JSON.stringify(finalCurrentUserForProvider)));

  return (
    <AuthProvider currentUser={finalCurrentUserForProvider}>
      <AppLayout currentUser={finalCurrentUserForProvider}>
        {children}
        <Toaster />
      </AppLayout>
    </AuthProvider>
  );
}

