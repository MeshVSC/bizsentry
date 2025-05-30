
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUsers, getCurrentUser } from '@/lib/actions/userActions'; // Using custom actions
import { AlertTriangle } from 'lucide-react';
import AddUserForm from '@/components/settings/AddUserForm';
import UserManagementTable from '@/components/settings/UserManagementTable';
import type { CurrentUser } from '@/types/user';

export default async function UserSettingsPage() {
  const currentUser: CurrentUser | null = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
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
        description="Manage application users and their roles (stored in a custom Supabase table)." 
      />
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Add new users or modify existing ones. This creates users in your custom Supabase table.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <AddUserForm />
          <UserManagementTable initialUsers={allUsersFromCustomTable} />
        </CardContent>
      </Card>
    </>
  );
}

