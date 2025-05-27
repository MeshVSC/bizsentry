
import PageHeader from '@/components/shared/PageHeader';
import { 
  getManagedCategoryOptions, 
  addManagedCategoryOption,
  deleteManagedCategoryOption,
  getManagedStorageLocationOptions,
  addManagedStorageLocationOption,
  deleteManagedStorageLocationOption,
  getManagedBinLocationOptions,
  addManagedBinLocationOption,
  deleteManagedBinLocationOption
} from '@/lib/actions/itemActions';
import { getAppSettings } from '@/lib/actions/settingsActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from '@/lib/actions/userActions';
import { AlertTriangle } from 'lucide-react';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          You do not have permission to view this page. Please contact an administrator.
        </p>
      </div>
    );
  }

  const initialCategories = await getManagedCategoryOptions();
  const initialStorageLocations = await getManagedStorageLocationOptions();
  const initialBinLocations = await getManagedBinLocationOptions();
  const initialAppSettings = await getAppSettings();

  return (
    <>
      <PageHeader 
        title="Application Settings" 
        description="Manage various settings and predefined options for the application." 
      />
      <Tabs defaultValue="application" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="storageLocations">Storage Locations</TabsTrigger>
          <TabsTrigger value="binLocations">Bin Locations</TabsTrigger>
        </TabsList>
        <TabsContent value="application">
          <Card>
            <CardHeader>
                <CardTitle>General Application Settings</CardTitle>
                <CardDescription>Control global behaviors of the application.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ApplicationSettingsForm currentSettings={initialAppSettings} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Add or remove categories available when creating/editing items.</CardDescription>
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
        </TabsContent>
        <TabsContent value="storageLocations">
          <Card>
             <CardHeader>
                <CardTitle>Manage Storage Locations</CardTitle>
                <CardDescription>Define common storage locations for your inventory.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ManageOptionsSection
                optionType="Storage Location"
                initialOptions={initialStorageLocations}
                addOptionAction={addManagedStorageLocationOption}
                deleteOptionAction={deleteManagedStorageLocationOption}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="binLocations">
          <Card>
            <CardHeader>
                <CardTitle>Manage Bin Locations</CardTitle>
                <CardDescription>Specify detailed bin or shelf locations within storage areas.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               <ManageOptionsSection
                optionType="Bin Location"
                initialOptions={initialBinLocations}
                addOptionAction={addManagedBinLocationOption}
                deleteOptionAction={deleteManagedBinLocationOption}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
