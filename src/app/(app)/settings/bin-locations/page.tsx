
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedBinLocationOptions, 
  addManagedBinLocationOption,
  deleteManagedBinLocationOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
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
        title="Manage Bin Locations"
        description="Specify detailed bin or shelf locations within storage areas."
      />
      <div className="glass-card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Bin Locations</h3>
          <p className="text-sm text-muted-foreground">Define specific bins, shelves, or spots.</p>
        </div>
        {loading ? <p>Loading bin locations...</p> : (
          <ManageOptionsSection
            optionType="bin_location" // Corrected from "Bin Location"
            initialOptions={initialBinLocations}
            addOptionAction={addManagedBinLocationOption}
            deleteOptionAction={deleteManagedBinLocationOption}
          />
        )}
      </div>
    </>
  );
}
