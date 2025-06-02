
import PageHeader from '@/components/shared/PageHeader';
import { getCurrentUser } from '@/lib/actions/userActions';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import { getAppSettings } from '@/lib/actions/settingsActions';
// import { redirect } from 'next/navigation'; // TEMPORARILY DISABLED

export interface ApplicationSettingsPageProps {
  // No longer receiving currentUser as a prop, will fetch its own
}

export default async function ApplicationSettingsPage(/* props: ApplicationSettingsPageProps */) {
  let currentUser: CurrentUser | null = null;
  let pageDebugMessage = "App Settings Page: Initializing...";
  let pageErrorFromGetCurrentUser: string | null = null;

  try {
    currentUser = await getCurrentUser(); // Page fetches its own user data
    if (!currentUser) {
      pageDebugMessage = "App Settings Page: getCurrentUser from page returned null. Would redirect to login.";
      // redirect('/login'); // TEMPORARILY DISABLED
    } else {
      pageDebugMessage = `App Settings Page: User successfully fetched by page: ${JSON.stringify(currentUser, null, 2)}`;
    }
  } catch (error: any) {
    pageErrorFromGetCurrentUser = error.message;
    pageDebugMessage = `App Settings Page: Error fetching user by page: ${error.message}. Would redirect to login.`;
    // redirect('/login'); // TEMPORARILY DISABLED
  }
  
  const userRole = currentUser?.role?.trim().toLowerCase();

  if (!currentUser || (userRole !== 'admin' && userRole !== 'manager')) {
    const accessDeniedDebugCurrentUserDisplay = currentUser ? JSON.stringify(currentUser, null, 2) : "currentUser is null (at access check by page)";
    const accessDeniedPageErrorDisplay = pageErrorFromGetCurrentUser ? `Error from page's getCurrentUser(): ${pageErrorFromGetCurrentUser}` : "No error from page's getCurrentUser(), but user is null or role insufficient.";
    
    return (
      <>
        <PageHeader title="Application Settings" description="Manage global application settings." />
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground text-center">
            You do not have permission to view this page. Please contact an administrator.
          </p>
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 text-yellow-300 rounded-md text-xs w-full max-w-2xl shadow">
            <h3 className="font-semibold mb-2 text-yellow-200">Debug Information (Access Denied by Page Context):</h3>
            <p className="mt-1">Page's getCurrentUser() Error: <code className="bg-background/30 p-1 rounded text-sm">{accessDeniedPageErrorDisplay}</code></p>
            <p className="mt-1">Current User Object by Page:</p>
            <pre className="whitespace-pre-wrap break-all bg-background/30 p-2 rounded text-sm">{accessDeniedDebugCurrentUserDisplay}</pre>
            <p className="mt-1">Computed User Role for Check: <code className="bg-background/30 p-1 rounded text-sm">{userRole || 'undefined'}</code></p>
            <p className="mt-1">Page Debug Message: <code className="bg-background/30 p-1 rounded text-sm">{pageDebugMessage}</code></p>
          </div>
        </div>
      </>
    );
  }

  const initialAppSettings = await getAppSettings();
  const accessGrantedDebugCurrentUserDisplay = currentUser ? JSON.stringify(currentUser, null, 2) : "currentUser is unexpectedly null (access granted path by page)";

  return (
    <>
      <PageHeader
        title="Application Settings"
        description="Manage global behaviors of the application."
      />
      <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 text-yellow-300 rounded-md text-xs shadow">
          <h3 className="font-semibold mb-1 text-yellow-200">Debug Information (Access Granted by Page Context):</h3>
          {pageErrorFromGetCurrentUser && <p className="text-destructive mt-1">Page's getCurrentUser() Error: <code className="bg-background/30 p-1 rounded text-sm">{pageErrorFromGetCurrentUser}</code></p>}
          <p className="text-foreground mt-1">Current User Object by Page:</p>
          <pre className="whitespace-pre-wrap break-all bg-background/30 p-2 rounded text-sm">{accessGrantedDebugCurrentUserDisplay}</pre>
          <p className="mt-1">Computed User Role for Check: <code className="bg-background/30 p-1 rounded text-sm">{userRole || 'undefined'}</code></p>
          <p className="mt-1">Page Debug Message: <code className="bg-background/30 p-1 rounded text-sm">{pageDebugMessage}</code></p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>General Application Settings</CardTitle>
            <CardDescription>Control global behaviors of the application.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ApplicationSettingsForm currentSettings={initialAppSettings} />
        </CardContent>
      </Card>
    </>
  );
}
