
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
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
            <CardContent className="pt-6">
              <ApplicationSettingsForm currentSettings={initialAppSettings} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
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
