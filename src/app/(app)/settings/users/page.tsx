
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, getUsers } from '@/lib/actions/userActions';
import { AlertTriangle } from 'lucide-react';
import AddUserForm from '@/components/settings/AddUserForm';
import UserManagementTable from '@/components/settings/UserManagementTable';

export default async function UserSettingsPage() {
  const currentUser = await getCurrentUser();

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
  
  const allUsers = await getUsers();

  return (
    <>
      <PageHeader 
        title="User Management" 
        description="Manage application users and their roles." 
      />
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Add new users or modify existing ones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <AddUserForm />
          <UserManagementTable initialUsers={allUsers} />
        </CardContent>
      </Card>
    </>
  );
}
