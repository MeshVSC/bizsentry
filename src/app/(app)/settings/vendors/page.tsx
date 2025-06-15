
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedVendorOptions, 
  addManagedVendorOption,  
  deleteManagedVendorOption, 
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
// AlertTriangle and useAuth removed
import { useEffect, useState } from 'react';

export default function VendorsSettingsPage() {
  // Auth checks removed
  const [initialVendors, setInitialVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoading(true);
        const options = await getManagedVendorOptions();
        setInitialVendors(options);
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
        title="Manage Vendors"
        description="Add or remove vendor options."
      />
      <div className="glass-card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Vendors</h3>
          <p className="text-sm text-muted-foreground">Maintain a list of your suppliers or vendors.</p>
        </div>
        {loading ? <p>Loading vendors...</p> : (
          <ManageOptionsSection
            optionType="vendor" // Corrected from "Vendor"
            initialOptions={initialVendors}
            addOptionAction={addManagedVendorOption}
            deleteOptionAction={deleteManagedVendorOption}
          />
        )}
      </div>
    </>
  );
}
