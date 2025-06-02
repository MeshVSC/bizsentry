
import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedProjectOptions,
  addManagedProjectOption,
  deleteManagedProjectOption,
} from '@/lib/actions/itemActions';
import { getCurrentUser } from '@/lib/actions/userActions'; // Page now calls getCurrentUser
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ProjectsSettingsPage() {
  let currentUser: CurrentUser | null = null;
  try {
    currentUser = await getCurrentUser(); // Should use cached version
    if (!currentUser) redirect('/login');
  } catch (error) {
    // console.error('[ProjectsSettingsPage] Error fetching user:', error);
    redirect('/login');
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

  const initialProjects = await getManagedProjectOptions();

  return (
    <>
      <PageHeader
        title="Manage Projects"
        description="Define projects items can be associated with."
      />
      <Card>
        <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>List projects for item association.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
           <ManageOptionsSection
            optionType="Project"
            initialOptions={initialProjects}
            addOptionAction={addManagedProjectOption}
            deleteOptionAction={deleteManagedProjectOption}
          />
        </CardContent>
      </Card>
    </>
  );
}
