
import PageHeader from '@/components/shared/PageHeader';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import { getAppSettings } from '@/lib/actions/settingsActions';
import { getCurrentUser, type GetCurrentUserResult } from '@/lib/actions/userActions';
// import { redirect } from 'next/navigation'; // Temporarily disabled

export default async function ApplicationSettingsPage() {
  let currentUser: CurrentUser | null = null;
  let pageDebugMessage: string | undefined = "App Settings Page: Initializing...";
  let pageErrorFromGetCurrentUser: string | undefined;

  try {
    const result: GetCurrentUserResult = await getCurrentUser();
    currentUser = result.user;
    pageDebugMessage = `App Settings Page: User ${currentUser ? `VALID (${currentUser.username})` : 'NULL'}. Debug from getCurrentUser: ${result.debugMessage || "No specific debug message from getCurrentUser."}`;
    if (result.debugMessage && !currentUser) {
        pageErrorFromGetCurrentUser = `Error from page's getCurrentUser(): ${result.debugMessage}`;
    }

    if (!currentUser) {
      pageDebugMessage += " Would redirect to login.";
      // redirect('/login'); // TEMPORARILY DISABLED
    }
  } catch (error: any) {
    pageErrorFromGetCurrentUser = `Critical error in page's getCurrentUser(): ${error.message}`;
    pageDebugMessage = `App Settings Page: CRITICAL ERROR fetching user by page: ${error.message}. Would redirect to login.`;
    // redirect('/login'); // TEMPORARILY DISABLED
  }
  
  const userRole = currentUser?.role?.trim().toLowerCase();

  if (userRole !== 'admin' && userRole !== 'manager') {
    return (
      <>
        <PageHeader title="Application Settings" description="Manage global application settings." />
        {/* Temporary Debug Box for Page */}
        <div style={{ backgroundColor: 'yellow', color: 'black', padding: '10px', margin: '10px 0', border: '1px solid orange', fontSize: '0.9rem' }}>
          <p style={{fontWeight: 'bold'}}>Debug Information (Access Denied by Page Context):</p>
          {pageErrorFromGetCurrentUser && <p><strong>Page's getCurrentUser() Error:</strong> {pageErrorFromGetCurrentUser}</p>}
          <p><strong>Current User Object by Page:</strong></p>
          <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{currentUser ? JSON.stringify(currentUser, null, 2) : "currentUser is null (at access check by page)"}</pre>
          <p><strong>Computed User Role for Check:</strong> {userRole || "undefined"}</p>
          <hr style={{margin: '5px 0'}}/>
          <p><strong>Page Debug Message:</strong> {pageDebugMessage}</p>
        </div>
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground text-center">
            You do not have permission to view this page. Please contact an administrator. User role found: {userRole || 'None'}. Required: admin or manager.
          </p>
        </div>
      </>
    );
  }

  const initialAppSettings = await getAppSettings();

  return (
    <>
      <PageHeader
        title="Application Settings"
        description="Manage global behaviors of the application."
      />
       {/* Temporary Debug Box for Page (Successful Render Case) */}
       { (pageErrorFromGetCurrentUser || !currentUser) && (
         <div style={{ backgroundColor: 'lightgoldenrodyellow', color: 'black', padding: '10px', margin: '10px 0', border: '1px solid gold', fontSize: '0.9rem' }}>
            <p style={{fontWeight: 'bold'}}>Debug Information (Page Context):</p>
            {pageErrorFromGetCurrentUser && <p><strong>Page's getCurrentUser() Error:</strong> {pageErrorFromGetCurrentUser}</p>}
             <p><strong>Current User Object by Page:</strong></p>
            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{currentUser ? JSON.stringify(currentUser, null, 2) : "currentUser is null"}</pre>
            <p><strong>Page Debug Message:</strong> {pageDebugMessage}</p>
        </div>
       )}
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
