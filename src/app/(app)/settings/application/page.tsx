
import PageHeader from '@/components/shared/PageHeader';
import { getAppSettings } from '@/lib/actions/settingsActions';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';

interface ApplicationSettingsPageProps {
  currentUserJson?: string; // Changed to accept JSON string
  currentUser?: CurrentUser | null; // Keep for other pages that might not be updated yet
}

export default async function ApplicationSettingsPage({ currentUserJson }: ApplicationSettingsPageProps) {
  const currentUser: CurrentUser | null = currentUserJson ? JSON.parse(currentUserJson) : null;

  const debugCurrentUserDisplay = currentUser ? JSON.stringify(currentUser, null, 2) : "currentUser (from JSON) is null";
  const rawJsonPropDisplay = currentUserJson !== undefined ? `currentUserJson prop: "${currentUserJson}"` : "currentUserJson prop: undefined";

  const userRole = currentUser?.role?.trim().toLowerCase();

  if (!currentUser || (userRole !== 'admin' && userRole !== 'manager')) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          You do not have permission to view this page. Please contact an administrator.
        </p>
        <div className="mt-4 p-4 bg-muted rounded-md text-xs w-full max-w-lg shadow">
          <h3 className="font-semibold mb-2 text-foreground">Debug Information (Access Denied Context):</h3>
          <p className="text-foreground">Raw JSON Prop Received by Page:</p>
          <pre className="whitespace-pre-wrap break-all bg-background p-2 rounded text-sm">{rawJsonPropDisplay}</pre>
          <p className="text-foreground mt-2">Parsed Current User Object by Page:</p>
          <pre className="whitespace-pre-wrap break-all bg-background p-2 rounded text-sm">{debugCurrentUserDisplay}</pre>
          <p className="mt-2 text-foreground">Computed User Role for Check: <code className="bg-background p-1 rounded text-sm">{userRole || 'undefined'}</code></p>
        </div>
      </div>
    );
  }

  const initialAppSettings = await getAppSettings();

  return (
    <>
      <PageHeader
        title="Application Settings"
        description="Manage global behaviors of the application."
      />
      <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 text-yellow-300 rounded-md text-xs shadow">
          <h3 className="font-semibold mb-1">Debug Information (Access Granted Context):</h3>
          <p>Raw JSON Prop Received by Page:</p>
          <pre className="whitespace-pre-wrap break-all bg-background/30 p-2 rounded text-sm">{rawJsonPropDisplay}</pre>
          <p className="text-foreground mt-1">Parsed Current User Object by Page:</p>
          <pre className="whitespace-pre-wrap break-all bg-background/30 p-2 rounded text-sm">{debugCurrentUserDisplay}</pre>
          <p className="mt-1">Computed User Role for Check: <code className="bg-background/30 p-1 rounded text-sm">{userRole || 'undefined'}</code></p>
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
