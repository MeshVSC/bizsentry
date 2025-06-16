
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedCategoryOptions,
  addManagedCategoryOption,
  deleteManagedCategoryOption,
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
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
        title="Manage Categories"
        description="Add or remove categories available when creating/editing items."
      />
      <div className="glass-card p-6">
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <p className="text-sm text-muted-foreground">Define the categories for your inventory items.</p>
        </div>
        {loading ? <p>Loading categories...</p> : (
          <ManageOptionsSection
            optionType="category" // Corrected from "Category"
            initialOptions={initialCategories}
            addOptionAction={addManagedCategoryOption}
            deleteOptionAction={deleteManagedCategoryOption}
          />
        )}
      </div>
    </>
  );
}
