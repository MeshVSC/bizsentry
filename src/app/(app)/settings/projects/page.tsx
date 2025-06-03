
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedProjectOptions, 
  addManagedProjectOption,  
  deleteManagedProjectOption, 
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      } catch (error) {
        // console.error("Failed to fetch project options:", error);
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
      <Card>
        <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>List projects for item association.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? <p>Loading projects...</p> : (
            <ManageOptionsSection
              optionType="project" // Corrected from "Project"
              initialOptions={initialProjects}
              addOptionAction={addManagedProjectOption}
              deleteOptionAction={deleteManagedProjectOption}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
