
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUsers } from '@/lib/actions/userActions';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import AddUserForm from '@/components/settings/AddUserForm';
import UserManagementTable from '@/components/settings/UserManagementTable';

// Accept currentUser as a prop
interface UserSettingsPageProps {
  currentUser: CurrentUser | null;
}

export default async function UserSettingsPage({ currentUser }: UserSettingsPageProps) {
  // DO NOT call getCurrentUser() here. Use the prop.
  const userRole = currentUser?.role?.trim().toLowerCase();

  if (!currentUser || userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          Only administrators can manage users.
        </p>
      </div>
    );
  }

  const allUsersFromCustomTable = await getUsers();

  return (
    <>
      <PageHeader
        title="User Management"
        description="Manage application users and their roles."
      />
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Add new users or modify existing ones. User data is stored in your database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <AddUserForm />
          <UserManagementTable initialUsers={allUsersFromCustomTable} />
        </CardContent>
      </Card>
    </>
  );
}
