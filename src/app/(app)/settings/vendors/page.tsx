
import PageHeader from '@/components/shared/PageHeader';
import { 
  getManagedVendorOptions,
  addManagedVendorOption,
  deleteManagedVendorOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Removed: import { getCurrentUser } from '@/lib/actions/userActions';
import type { CurrentUser } from '@/types/user'; // Keep for prop type
import { AlertTriangle } from 'lucide-react';

// Accept currentUser as a prop
export default async function VendorsSettingsPage({ currentUser }: { currentUser: CurrentUser | null }) {
  // const currentUser = await getCurrentUser(); // Removed direct call
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

  const initialVendors = await getManagedVendorOptions();

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
           <ManageOptionsSection
            optionType="Vendor"
            initialOptions={initialVendors}
            addOptionAction={addManagedVendorOption}
            deleteOptionAction={deleteManagedVendorOption}
          />
        </CardContent>
      </Card>
    </>
  );
}
