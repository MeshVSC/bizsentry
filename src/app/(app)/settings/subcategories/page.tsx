
import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedSubcategoryOptions,
  addManagedSubcategoryOption,
  deleteManagedSubcategoryOption,
} from '@/lib/actions/itemActions';
import { getCurrentUser } from '@/lib/actions/userActions'; // Page now calls getCurrentUser
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function SubcategoriesSettingsPage() {
  let currentUser: CurrentUser | null = null;
  try {
    currentUser = await getCurrentUser(); // Should use cached version
    if (!currentUser) redirect('/login');
  } catch (error) {
    // console.error('[SubcategoriesSettingsPage] Error fetching user:', error);
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

  const initialSubcategories = await getManagedSubcategoryOptions();

  return (
    <>
      <PageHeader
        title="Manage Subcategories"
        description="Add or remove subcategories for items."
      />
      <Card>
        <CardHeader>
            <CardTitle>Subcategories</CardTitle>
            <CardDescription>Define sub-classifications for your inventory items.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ManageOptionsSection
            optionType="Subcategory"
            initialOptions={initialSubcategories}
            addOptionAction={addManagedSubcategoryOption}
            deleteOptionAction={deleteManagedSubcategoryOption}
          />
        </CardContent>
      </Card>
    </>
  );
}
