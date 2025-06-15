
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedStorageLocationOptions, 
  addManagedStorageLocationOption,
  deleteManagedStorageLocationOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// AlertTriangle and useAuth removed
import { useEffect, useState } from 'react';

export default function StorageLocationsSettingsPage() {
  // Auth checks removed
  const [initialStorageLocations, setInitialStorageLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoading(true);
        const options = await getManagedStorageLocationOptions();
        setInitialStorageLocations(options);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // Access denied section removed.

  return (
    <>
      <PageHeader
        title="Manage Storage Locations"
        description="Define common storage locations for your inventory."
      />
      <div className="glass-card p-6">
         <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Storage Locations</h3>
            <p className="text-sm text-muted-foreground">Specify general areas where items are stored.</p>
        </div>
        {loading ? <p>Loading storage locations...</p> : (
          <ManageOptionsSection
            optionType="storage_location" // Corrected from "Storage Location"
            initialOptions={initialStorageLocations}
            addOptionAction={addManagedStorageLocationOption}
            deleteOptionAction={deleteManagedStorageLocationOption}
          />
        )}
      </div>
    </>
  );
}
