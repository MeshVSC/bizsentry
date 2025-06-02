
import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedBinLocationOptions,
  addManagedBinLocationOption,
  deleteManagedBinLocationOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';

// Accept currentUser as a prop
interface BinLocationsSettingsPageProps {
  currentUser: CurrentUser | null;
}

export default async function BinLocationsSettingsPage({ currentUser }: BinLocationsSettingsPageProps) {
  // DO NOT call getCurrentUser() here. Use the prop.
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

  const initialBinLocations = await getManagedBinLocationOptions();

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
           <ManageOptionsSection
            optionType="Bin Location"
            initialOptions={initialBinLocations}
            addOptionAction={addManagedBinLocationOption}
            deleteOptionAction={deleteManagedBinLocationOption}
          />
        </CardContent>
      </Card>
    </>
  );
}
