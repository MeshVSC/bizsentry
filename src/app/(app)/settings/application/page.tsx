
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
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
            <div className="glass-card p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">General Application Settings</h3>
                    <p className="text-sm text-muted-foreground">Control global behaviors of the application.</p>
                </div>
                <p>Loading settings...</p>
            </div>
        </>
     );
  }

  return (
    <>
      <PageHeader
        title="Application Settings"
        description="Manage global behaviors of the application."
      />
      <div className="glass-card p-6">
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">General Application Settings</h3>
            <p className="text-sm text-muted-foreground">Control global behaviors of the application.</p>
        </div>
        <ApplicationSettingsForm currentSettings={initialAppSettings} />
      </div>
    </>
  );
}
