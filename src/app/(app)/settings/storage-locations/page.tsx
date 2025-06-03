
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
      } catch (error) {
        // console.error("Failed to fetch storage location options:", error);
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
      <Card>
         <CardHeader>
            <CardTitle>Storage Locations</CardTitle>
            <CardDescription>Specify general areas where items are stored.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? <p>Loading storage locations...</p> : (
            <ManageOptionsSection
              optionType="storage_location" // Corrected from "Storage Location"
              initialOptions={initialStorageLocations}
              addOptionAction={addManagedStorageLocationOption}
              deleteOptionAction={deleteManagedStorageLocationOption}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
