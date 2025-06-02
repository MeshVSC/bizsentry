
import PageHeader from '@/components/shared/PageHeader';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import { getAppSettings } from '@/lib/actions/settingsActions';
// Ensure no redirect import from next/navigation if page doesn't handle it
// import { redirect } from 'next/navigation'; // TEMPORARILY DISABLED

export interface ApplicationSettingsPageProps {
  currentUser?: CurrentUser | null; // Prop passed from GroupedAppLayout
}

export default async function ApplicationSettingsPage(props: ApplicationSettingsPageProps) {
  const receivedCurrentUser = props.currentUser; // Use the prop
  const userRole = receivedCurrentUser?.role?.trim().toLowerCase();

  let pageDebugMessage = `App Settings Page: Prop currentUser is ${receivedCurrentUser ? 'defined' : 'null or undefined'}.`;
  let pageErrorDisplay: string | null = null;

  if (!receivedCurrentUser) {
    pageErrorDisplay = "The 'currentUser' prop was not received or is null.";
  } else if (userRole !== 'admin' && userRole !== 'manager') {
    pageErrorDisplay = `Access denied based on received role: '${userRole || 'undefined'}'.`;
  }
  
  if (!receivedCurrentUser || (userRole !== 'admin' && userRole !== 'manager')) {
    // const accessDeniedDebugCurrentUserDisplay = receivedCurrentUser ? JSON.stringify(receivedCurrentUser, null, 2) : "currentUser prop is null or undefined";
    
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
            <h3 className="font-semibold mb-2 text-yellow-200">Debug Information (Access Denied by Page Prop Context):</h3>
            {pageErrorDisplay && <p className="mt-1">Page Error: <code className="bg-background/30 p-1 rounded text-sm">{pageErrorDisplay}</code></p>}
            <p className="mt-1">Current User Prop Received by Page:</p>
            <pre className="whitespace-pre-wrap break-all bg-background/30 p-2 rounded text-sm">{receivedCurrentUser ? JSON.stringify(receivedCurrentUser, null, 2) : "currentUser prop is null or undefined"}</pre>
            <p className="mt-1">Computed User Role (from prop) for Check: <code className="bg-background/30 p-1 rounded text-sm">{userRole || 'undefined'}</code></p>
            <p className="mt-1">Page Debug Message: <code className="bg-background/30 p-1 rounded text-sm">{pageDebugMessage}</code></p>
          </div>
        </div>
      </>
    );
  }

  const initialAppSettings = await getAppSettings();
  const accessGrantedDebugCurrentUserDisplay = receivedCurrentUser ? JSON.stringify(receivedCurrentUser, null, 2) : "currentUser prop is unexpectedly null (access granted path by page)";

  return (
    <>
      <PageHeader
        title="Application Settings"
        description="Manage global behaviors of the application."
      />
      <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 text-yellow-300 rounded-md text-xs shadow">
          <h3 className="font-semibold mb-1 text-yellow-200">Debug Information (Access Granted by Page Prop Context):</h3>
          <p className="text-foreground mt-1">Current User Prop Received by Page:</p>
          <pre className="whitespace-pre-wrap break-all bg-background/30 p-2 rounded text-sm">{accessGrantedDebugCurrentUserDisplay}</pre>
          <p className="mt-1">Computed User Role (from prop) for Check: <code className="bg-background/30 p-1 rounded text-sm">{userRole || 'undefined'}</code></p>
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
