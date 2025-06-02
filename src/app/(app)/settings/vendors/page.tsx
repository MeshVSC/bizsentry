
"use client"; // This page is now a Client Component

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedVendorOptions, // Server action
  addManagedVendorOption,  // Server action
  deleteManagedVendorOption, // Server action
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Use client-side context
import { useEffect, useState } from 'react';

export default function VendorsSettingsPage() {
  const { currentUser } = useAuth();
  const [initialVendors, setInitialVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
        try {
          setLoading(true);
          const options = await getManagedVendorOptions();
          setInitialVendors(options);
        } catch (error) {
          console.error("Failed to fetch vendor options:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchOptions();
  }, [currentUser]);
  
  const userRole = currentUser?.role?.trim().toLowerCase();

  if (!currentUser || (userRole !== 'admin' && userRole !== 'manager')) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

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
              optionType="Vendor"
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
