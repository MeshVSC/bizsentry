
import PageHeader from '@/components/shared/PageHeader';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import { getAppSettings } from '@/lib/actions/settingsActions';
import { getCurrentUser } from '@/lib/actions/userActions'; // Page calls getCurrentUser
import { redirect } from 'next/navigation';

export default async function ApplicationSettingsPage() {
  let currentUser: CurrentUser | null = null;
  try {
    currentUser = await getCurrentUser(); // Call should hit React.cache if layout called it first
    if (!currentUser) {
      redirect('/login'); // Safeguard redirect
    }
  } catch (error) {
    redirect('/login'); // Safeguard redirect if getCurrentUser throws
  }
  
  const userRole = currentUser?.role?.trim().toLowerCase();

  if (userRole !== 'admin' && userRole !== 'manager') {
    return (
      <>
        <PageHeader title="Application Settings" description="Manage global application settings." />
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground text-center">
            You do not have permission to view this page. Please contact an administrator.
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
      {/* Removed yellow debug box */}
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
