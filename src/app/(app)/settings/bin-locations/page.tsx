
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedBinLocationOptions, 
  addManagedBinLocationOption,
  deleteManagedBinLocationOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// AlertTriangle and useAuth removed
import { useEffect, useState } from 'react';

export default function BinLocationsSettingsPage() {
  // Auth checks removed
  const [initialBinLocations, setInitialBinLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoading(true);
        const options = await getManagedBinLocationOptions();
        setInitialBinLocations(options);
      } catch (error) {
        // console.error("Failed to fetch bin location options:", error);
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
        title="Manage Bin Locations"
        description="Specify detailed bin or shelf locations within storage areas."
      />
      <Card>
        <CardHeader>
            <CardTitle>Bin Locations</CardTitle>
            <CardDescription>Define specific bins, shelves, or spots.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? <p>Loading bin locations...</p> : (
            <ManageOptionsSection
              optionType="bin_location" // Corrected from "Bin Location"
              initialOptions={initialBinLocations}
              addOptionAction={addManagedBinLocationOption}
              deleteOptionAction={deleteManagedBinLocationOption}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
