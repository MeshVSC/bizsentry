
import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedSubcategoryOptions,
  addManagedSubcategoryOption,
  deleteManagedSubcategoryOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';

// Accept currentUser as a prop
interface SubcategoriesSettingsPageProps {
  currentUser: CurrentUser | null;
}

export default async function SubcategoriesSettingsPage({ currentUser }: SubcategoriesSettingsPageProps) {
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
