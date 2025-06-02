
import PageHeader from '@/components/shared/PageHeader';
import { 
  getManagedRoomOptions,
  addManagedRoomOption,
  deleteManagedRoomOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/actions/userActions';
import { AlertTriangle } from 'lucide-react';

export default async function RoomsSettingsPage() {
  const currentUser = await getCurrentUser();
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

  const initialRooms = await getManagedRoomOptions();

  return (
    <>
      <PageHeader 
        title="Manage Rooms" 
        description="Define rooms or areas where items are located." 
      />
      <Card>
        <CardHeader>
            <CardTitle>Rooms</CardTitle>
            <CardDescription>Specify rooms or distinct physical areas.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
           <ManageOptionsSection
            optionType="Room"
            initialOptions={initialRooms}
            addOptionAction={addManagedRoomOption}
            deleteOptionAction={deleteManagedRoomOption}
          />
        </CardContent>
      </Card>
    </>
  );
}

