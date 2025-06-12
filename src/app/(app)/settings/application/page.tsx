
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// AlertTriangle and useAuth removed
import { getAppSettings } from '@/lib/actions/settingsActions';
import { useEffect, useState } from 'react';
import type { AppSettings } from '@/lib/actions/settingsActions';

export default function ApplicationSettingsPage() {
  // Auth checks removed
  const [initialAppSettings, setInitialAppSettings] = useState<AppSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoadingSettings(true);
        const settings = await getAppSettings(); 
        setInitialAppSettings(settings);
      } catch {
      } finally {
        setLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []); 

  // Access denied section removed as auth is removed.
  
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
