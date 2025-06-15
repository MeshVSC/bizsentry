
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
      <div className="glass-card p-6">
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Subcategories</h3>
            <p className="text-sm text-muted-foreground">Define sub-classifications for your inventory items.</p>
        </div>
        {loading ? <p>Loading subcategories...</p> : (
          <ManageOptionsSection
            optionType="subcategory" // Corrected from "Subcategory"
            initialOptions={initialSubcategories}
            addOptionAction={addManagedSubcategoryOption}
            deleteOptionAction={deleteManagedSubcategoryOption}
          />
        )}
      </div>
    </>
  );
}
