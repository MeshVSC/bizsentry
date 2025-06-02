
import PageHeader from '@/components/shared/PageHeader';
import { getCurrentUser } from '@/lib/actions/userActions'; // Page now calls this
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import { getAppSettings } from '@/lib/actions/settingsActions';
import { redirect } from 'next/navigation';


export default async function ApplicationSettingsPage() {
  let currentUser: CurrentUser | null = null;
  let pageDebugMessage = "App Settings Page: Initializing...";

  try {
    currentUser = await getCurrentUser(); // Pages now fetch their own user data (should be cached)
    if (!currentUser) { // Should be caught by layout, but defensive check
        pageDebugMessage = "App Settings Page: getCurrentUser returned null, redirecting to login.";
        redirect('/login'); 
    }
    pageDebugMessage = `App Settings Page: User successfully fetched: ${JSON.stringify(currentUser, null, 2)}`;
  } catch (error: any) {
    pageDebugMessage = `App Settings Page: Error fetching user: ${error.message}. Redirecting.`;
    // console.error('[ApplicationSettingsPage] Error fetching user:', error.message);
    redirect('/login'); // Redirect if fetching user fails
  }
  
  const userRole = currentUser?.role?.trim().toLowerCase();

  if (userRole !== 'admin' && userRole !== 'manager') {
    const accessDeniedDebugCurrentUserDisplay = currentUser ? JSON.stringify(currentUser, null, 2) : "currentUser is null (at access check)";
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          You do not have permission to view this page. Please contact an administrator.
        </p>
        <div className="mt-4 p-4 bg-muted rounded-md text-xs w-full max-w-lg shadow">
          <h3 className="font-semibold mb-2 text-foreground">Debug Information (Access Denied Context):</h3>
          <p className="text-foreground mt-2">Current User Object by Page:</p>
          <pre className="whitespace-pre-wrap break-all bg-background p-2 rounded text-sm">{accessDeniedDebugCurrentUserDisplay}</pre>
          <p className="mt-2 text-foreground">Computed User Role for Check: <code className="bg-background p-1 rounded text-sm">{userRole || 'undefined'}</code></p>
        </div>
      </div>
    );
  }

  const initialAppSettings = await getAppSettings();
  const accessGrantedDebugCurrentUserDisplay = currentUser ? JSON.stringify(currentUser, null, 2) : "currentUser is unexpectedly null (access granted path)";


  return (
    <>
      <PageHeader
        title="Application Settings"
        description="Manage global behaviors of the application."
      />
      <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 text-yellow-300 rounded-md text-xs shadow">
          <h3 className="font-semibold mb-1">Debug Information (Access Granted Context):</h3>
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
