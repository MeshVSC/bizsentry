
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUsers, getRoleForSupabaseUser } from '@/lib/actions/userActions';
import { AlertTriangle } from 'lucide-react';
import AddUserForm from '@/components/settings/AddUserForm';
import UserManagementTable from '@/components/settings/UserManagementTable';
import { supabase } from '@/lib/supabase/client'; // We might need this if we want to check current Supabase user on server
                                                // However, for simplicity, access control might be client-side or passed down.
                                                // For now, let's assume AppLayout handles the core auth check.
                                                // This page needs to determine if the *logged-in Supabase user* has admin rights
                                                // to manage the *local* user list.

export default async function UserSettingsPage() {
  // Ideally, get the current Supabase user on the server if possible,
  // or this check has to be more sophisticated if AppLayout is purely client-side for auth state.
  // For now, this is a placeholder for server-side role check for this specific page.
  // This is complex because Supabase browser client doesn't give user session easily on server for RSC.
  // We will rely on AppLayout redirecting if not logged in.
  // The check here is if the logged-in user (from Supabase) has an 'admin' role in our app's user store.
  
  // This is a simplified approach. For robust server-side role checking with Supabase client auth,
  // you'd typically use `@supabase/auth-helpers-nextjs`.
  // Since we are keeping `userActions.ts` for managing `_usersStore`, this page will manage that.
  // The person accessing THIS page needs to be an admin.
  
  // This check needs to be done carefully. We'll assume for now that if a user
  // reaches this page, AppLayout has confirmed they are logged in.
  // We then need to check their role for *this specific application's user list*.
  
  // const { data: { user: supabaseUser } } = await supabase.auth.getUser(); // This won't work in RSC without auth-helpers
  // For now, this page will render, and if the user isn't an admin based on local store + Supabase email,
  // the components inside might restrict functionality or AppLayout would have redirected.
  // This part is tricky with the current setup.

  // Fetching users for the UserManagementTable (from globalThis._usersStore)
  const allUsersFromLocalStore = await getUsers();

  // The content below is for managing the local _usersStore.
  // A true admin (logged in via Supabase and having 'admin' role in _usersStore)
  // should be the only one seeing and using this.
  // This page should probably fetch the current Supabase user's app role.
  // For simplicity, I'm hardcoding a check that would need real implementation.
  const anAdminIsViewing = true; // Placeholder: In reality, check current Supabase user's app role.


  if (!anAdminIsViewing) { // This check needs proper implementation
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
  
  return (
    <>
      <PageHeader 
        title="User Management (Local Store)" 
        description="Manage application user roles (stored in-app, separate from Supabase auth)." 
      />
      <Card>
        <CardHeader>
          <CardTitle>Users (Local Role Assignment)</CardTitle>
          <CardDescription>Add new users or modify existing ones in the local role store. This does NOT create Supabase login accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <AddUserForm />
          <UserManagementTable initialUsers={allUsersFromLocalStore} />
        </CardContent>
      </Card>
    </>
  );
}
