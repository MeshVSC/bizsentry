
"use client"; // This page is now a Client Component

import PageHeader from '@/components/shared/PageHeader';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { getAppSettings } from '@/lib/actions/settingsActions'; // This is a server action, can be called from client
import { useAuth } from '@/contexts/AuthContext'; // Use client-side context
import { useEffect, useState } from 'react';
import type { AppSettings } from '@/lib/actions/settingsActions';

export default function ApplicationSettingsPage() {
  const { currentUser } = useAuth(); // Get user from client-side context
  const [initialAppSettings, setInitialAppSettings] = useState<AppSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoadingSettings(true);
        const settings = await getAppSettings(); // Server Action call
        setInitialAppSettings(settings);
      } catch (error) {
        console.error("Failed to fetch app settings:", error);
        // Optionally, set some error state to display to user
      } finally {
        setLoadingSettings(false);
      }
    }
    if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
      fetchSettings();
    }
  }, [currentUser]); // Re-fetch if currentUser changes (e.g., on logout/login if context updates)

  const userRole = currentUser?.role?.trim().toLowerCase();

  if (!currentUser || (userRole !== 'admin' && userRole !== 'manager')) {
    return (
      <>
        <PageHeader title="Application Settings" description="Manage global application settings." />
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground text-center">
            You do not have permission to view this page. User role found: {userRole || 'None'}. Required: admin or manager.
          </p>
        </div>
      </>
    );
  }
  
  if (loadingSettings || !initialAppSettings) {
     return (
        <>
            <PageHeader title="Application Settings" description="Manage global application settings." />
            <Card>
                <CardHeader>
                    <CardTitle>General Application Settings</CardTitle>
                    <CardDescription>Control global behaviors of the application.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <p>Loading settings...</p>
                </CardContent>
            </Card>
        </>
     );
  }

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
