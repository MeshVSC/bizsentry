
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedProjectOptions, 
  addManagedProjectOption,  
  deleteManagedProjectOption, 
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
// AlertTriangle and useAuth removed
import { useEffect, useState } from 'react';

export default function ProjectsSettingsPage() {
  // Auth checks removed
  const [initialProjects, setInitialProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoading(true);
        const options = await getManagedProjectOptions();
        setInitialProjects(options);
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
        title="Manage Projects"
        description="Define projects items can be associated with."
      />
      <div className="glass-card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Projects</h3>
          <p className="text-sm text-muted-foreground">List projects for item association.</p>
        </div>
        {loading ? <p>Loading projects...</p> : (
          <ManageOptionsSection
            optionType="project" // Corrected from "Project"
            initialOptions={initialProjects}
            addOptionAction={addManagedProjectOption}
            deleteOptionAction={deleteManagedProjectOption}
          />
        )}
      </div>
    </>
  );
}
