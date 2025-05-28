
import PageHeader from '@/components/shared/PageHeader';
import { 
  getManagedCategoryOptions, 
  addManagedCategoryOption,
  deleteManagedCategoryOption,
  getManagedSubcategoryOptions, // New
  addManagedSubcategoryOption,    // New
  deleteManagedSubcategoryOption, // New
  getManagedStorageLocationOptions,
  addManagedStorageLocationOption,
  deleteManagedStorageLocationOption,
  getManagedBinLocationOptions,
  addManagedBinLocationOption,
  deleteManagedBinLocationOption,
  getManagedRoomOptions,      // New
  addManagedRoomOption,       // New
  deleteManagedRoomOption,    // New
  getManagedVendorOptions,    // New
  addManagedVendorOption,     // New
  deleteManagedVendorOption,  // New
  getManagedProjectOptions,   // New
  addManagedProjectOption,    // New
  deleteManagedProjectOption  // New
} from '@/lib/actions/itemActions';
import { getAppSettings } from '@/lib/actions/settingsActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import ApplicationSettingsForm from '@/components/settings/ApplicationSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser, getUsers } from '@/lib/actions/userActions';
import { AlertTriangle } from 'lucide-react';
import AddUserForm from '@/components/settings/AddUserForm';
import UserManagementTable from '@/components/settings/UserManagementTable';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
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
  const initialSubcategories = await getManagedSubcategoryOptions(); // New
  const initialStorageLocations = await getManagedStorageLocationOptions();
  const initialBinLocations = await getManagedBinLocationOptions();
  const initialRooms = await getManagedRoomOptions(); // New
  const initialVendors = await getManagedVendorOptions(); // New
  const initialProjects = await getManagedProjectOptions(); // New
  const initialAppSettings = await getAppSettings();
  const allUsers = currentUser.role === 'admin' ? await getUsers() : []; // Only admin can fetch users

  // TODO: Item 7 - Evaluate consolidating product setup settings into a single page or a more unified section.
  // For now, we'll use tabs. If this list grows too long, consider a nested menu or dedicated sub-pages for "Product Options".

  return (
    <>
      <PageHeader 
        title="Application Settings" 
        description="Manage various settings, predefined options, and users for the application." 
      />
      <Tabs defaultValue="application" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 mb-6">
          <TabsTrigger value="application">Application</TabsTrigger>
          {currentUser.role === 'admin' && <TabsTrigger value="users">User Management</TabsTrigger>}
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          <TabsTrigger value="storageLocations">Storage</TabsTrigger>
          <TabsTrigger value="binLocations">Bin Locations</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
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

        {currentUser.role === 'admin' && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage application users and their roles. Only accessible by Admins.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <AddUserForm />
                <UserManagementTable initialUsers={allUsers} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

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

        <TabsContent value="subcategories"> {/* New Tab */}
          <Card>
            <CardHeader>
                <CardTitle>Manage Subcategories</CardTitle>
                <CardDescription>Add or remove subcategories for items.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ManageOptionsSection
                optionType="Subcategory"
                initialOptions={initialSubcategories}
                addOptionAction={addManagedSubcategoryOption}
                deleteOptionAction={deleteManagedSubcategoryOption}
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

        <TabsContent value="rooms"> {/* New Tab */}
          <Card>
            <CardHeader>
                <CardTitle>Manage Rooms</CardTitle>
                <CardDescription>Define rooms or areas where items are located.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               <ManageOptionsSection
                optionType="Room"
                initialOptions={initialRooms}
                addOptionAction={addManagedRoomOption}
                deleteOptionAction={deleteManagedRoomOption}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors"> {/* New Tab */}
          <Card>
            <CardHeader>
                <CardTitle>Manage Vendors</CardTitle>
                <CardDescription>Add or remove vendor options.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               <ManageOptionsSection
                optionType="Vendor"
                initialOptions={initialVendors}
                addOptionAction={addManagedVendorOption}
                deleteOptionAction={deleteManagedVendorOption}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects"> {/* New Tab */}
          <Card>
            <CardHeader>
                <CardTitle>Manage Projects</CardTitle>
                <CardDescription>Define projects items can be associated with.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               <ManageOptionsSection
                optionType="Project"
                initialOptions={initialProjects}
                addOptionAction={addManagedProjectOption}
                deleteOptionAction={deleteManagedProjectOption}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
