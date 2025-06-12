
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedSubcategoryOptions,
  addManagedSubcategoryOption,
  deleteManagedSubcategoryOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// AlertTriangle and useAuth removed
import { useEffect, useState } from 'react';

export default function SubcategoriesSettingsPage() {
  // Auth checks removed
  const [initialSubcategories, setInitialSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoading(true);
        const options = await getManagedSubcategoryOptions();
        setInitialSubcategories(options);
      } catch {
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
        title="Manage Subcategories"
        description="Add or remove subcategories for items."
      />
      <Card>
        <CardHeader>
            <CardTitle>Subcategories</CardTitle>
            <CardDescription>Define sub-classifications for your inventory items.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? <p>Loading subcategories...</p> : (
            <ManageOptionsSection
              optionType="subcategory" // Corrected from "Subcategory"
              initialOptions={initialSubcategories}
              addOptionAction={addManagedSubcategoryOption}
              deleteOptionAction={deleteManagedSubcategoryOption}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
