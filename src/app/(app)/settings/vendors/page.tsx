
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedVendorOptions, 
  addManagedVendorOption,  
  deleteManagedVendorOption, 
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      } catch (error) {
        // console.error("Failed to fetch vendor options:", error);
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
      <Card>
        <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>Maintain a list of your suppliers or vendors.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? <p>Loading vendors...</p> : (
            <ManageOptionsSection
              optionType="vendor" // Corrected from "Vendor"
              initialOptions={initialVendors}
              addOptionAction={addManagedVendorOption}
              deleteOptionAction={deleteManagedVendorOption}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
