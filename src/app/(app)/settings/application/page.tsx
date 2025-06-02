
import PageHeader from '@/components/shared/PageHeader';
import { getAppSettings } from '@/lib/actions/settingsActions';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Removed: import { getCurrentUser } from '@/lib/actions/userActions';
import type { CurrentUser } from '@/types/user'; // Keep for prop type
import { AlertTriangle } from 'lucide-react';

// Accept currentUser as a prop
export default async function ApplicationSettingsPage({ currentUser }: { currentUser: CurrentUser | null }) {
  // const currentUser = await getCurrentUser(); // Removed direct call

  const userRole = currentUser?.role?.trim().toLowerCase();

  if (!currentUser || (userRole !== 'admin' && userRole !== 'manager')) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          You do not have permission to view this page. Please contact an administrator.
        </p>
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
