
import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedCategoryOptions,
  addManagedCategoryOption,
  deleteManagedCategoryOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CurrentUser } from '@/types/user';
import { AlertTriangle } from 'lucide-react';

// Accept currentUser as a prop
interface CategoriesSettingsPageProps {
  currentUser: CurrentUser | null;
}

export default async function CategoriesSettingsPage({ currentUser }: CategoriesSettingsPageProps) {
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

  const initialCategories = await getManagedCategoryOptions();

  return (
    <>
      <PageHeader
        title="Manage Categories"
        description="Add or remove categories available when creating/editing items."
      />
      <Card>
        <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Define the categories for your inventory items.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ManageOptionsSection
            optionType="Category"
            initialOptions={initialCategories}
            addOptionAction={addManagedCategoryOption}
            deleteOptionAction={deleteManagedCategoryOption}
          />
        </CardContent>
      </Card>
    </>
  );
}
