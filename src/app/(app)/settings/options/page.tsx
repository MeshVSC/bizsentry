
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
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsOptionsPage() {
  const initialCategories = await getManagedCategoryOptions();
  const initialStorageLocations = await getManagedStorageLocationOptions();
  const initialBinLocations = await getManagedBinLocationOptions();

  return (
    <>
      <PageHeader 
        title="Manage Dropdown Options" 
        description="Add or remove options for Categories, Storage Locations, and Bin Locations used in item forms." 
      />
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="storageLocations">Storage Locations</TabsTrigger>
          <TabsTrigger value="binLocations">Bin Locations</TabsTrigger>
        </TabsList>
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
