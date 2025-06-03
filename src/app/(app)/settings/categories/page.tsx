
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedCategoryOptions,
  addManagedCategoryOption,
  deleteManagedCategoryOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// AlertTriangle and useAuth removed
import { useEffect, useState } from 'react';

export default function CategoriesSettingsPage() {
  // Auth checks removed
  const [initialCategories, setInitialCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoading(true);
        const options = await getManagedCategoryOptions();
        setInitialCategories(options);
      } catch (error) {
        // console.error("Failed to fetch category options:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // Access denied section removed.

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
          {loading ? <p>Loading categories...</p> : (
            <ManageOptionsSection
              optionType="category" // Corrected from "Category"
              initialOptions={initialCategories}
              addOptionAction={addManagedCategoryOption}
              deleteOptionAction={deleteManagedCategoryOption}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
