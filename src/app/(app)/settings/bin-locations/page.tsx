
"use client"; // This page is now a Client Component

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedBinLocationOptions, // Server action
  addManagedBinLocationOption,  // Server action
  deleteManagedBinLocationOption, // Server action
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Use client-side context
import { useEffect, useState } from 'react';

export default function BinLocationsSettingsPage() {
  const { currentUser } = useAuth();
  const [initialBinLocations, setInitialBinLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
        try {
          setLoading(true);
          const options = await getManagedBinLocationOptions();
          setInitialBinLocations(options);
        } catch (error) {
          console.error("Failed to fetch bin location options:", error);
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
              optionType="Bin Location"
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
