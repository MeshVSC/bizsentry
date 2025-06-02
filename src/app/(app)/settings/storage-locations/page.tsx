
import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedStorageLocationOptions,
  addManagedStorageLocationOption,
  deleteManagedStorageLocationOption,
} from '@/lib/actions/itemActions';
import { getCurrentUser } from '@/lib/actions/userActions'; // Page calls getCurrentUser
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function StorageLocationsSettingsPage() {
  let currentUser: CurrentUser | null = null;
  try {
    currentUser = await getCurrentUser(); // Call should hit React.cache
    if (!currentUser) {
      redirect('/login'); // Safeguard redirect
    }
  } catch (error) {
    redirect('/login'); // Safeguard redirect if getCurrentUser throws
  }
  
  const userRole = currentUser?.role?.trim().toLowerCase();

  if (userRole !== 'admin' && userRole !== 'manager') {
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

  const initialStorageLocations = await getManagedStorageLocationOptions();

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
          <ManageOptionsSection
            optionType="Storage Location"
            initialOptions={initialStorageLocations}
            addOptionAction={addManagedStorageLocationOption}
            deleteOptionAction={deleteManagedStorageLocationOption}
          />
        </CardContent>
      </Card>
    </>
  );
}
