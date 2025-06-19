"use client";

import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  // Categories
  getManagedCategoryOptions,
  addManagedCategoryOption,
  deleteManagedCategoryOption,
  // Subcategories
  getManagedSubcategoryOptions,
  addManagedSubcategoryOption,
  deleteManagedSubcategoryOption,
  // Storage Locations
  getManagedStorageLocationOptions,
  addManagedStorageLocationOption,
  deleteManagedStorageLocationOption,
  // Bin Locations
  getManagedBinLocationOptions,
  addManagedBinLocationOption,
  deleteManagedBinLocationOption,
  // Rooms
  getManagedRoomOptions,
  addManagedRoomOption,
  deleteManagedRoomOption,
  // Vendors
  getManagedVendorOptions,
  addManagedVendorOption,
  deleteManagedVendorOption,
  // Projects
  getManagedProjectOptions,
  addManagedProjectOption,
  deleteManagedProjectOption,
} from '@/lib/actions/itemActions';

export default function MasterListsPage() {
  // State for all option types
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [storageLocations, setStorageLocations] = useState<string[]>([]);
  const [binLocations, setBinLocations] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllOptions() {
      try {
        setLoading(true);
        const [
          categoryOptions,
          subcategoryOptions,
          storageLocationOptions,
          binLocationOptions,
          roomOptions,
          vendorOptions,
          projectOptions,
        ] = await Promise.all([
          getManagedCategoryOptions(),
          getManagedSubcategoryOptions(),
          getManagedStorageLocationOptions(),
          getManagedBinLocationOptions(),
          getManagedRoomOptions(),
          getManagedVendorOptions(),
          getManagedProjectOptions(),
        ]);

        setCategories(categoryOptions);
        setSubcategories(subcategoryOptions);
        setStorageLocations(storageLocationOptions);
        setBinLocations(binLocationOptions);
        setRooms(roomOptions);
        setVendors(vendorOptions);
        setProjects(projectOptions);
      } catch {
        // Error handling is managed within individual components
      } finally {
        setLoading(false);
      }
    }
    fetchAllOptions();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Master Lists"
          description="Manage the foundational lists that power your inventory system."
        />
        <div className="glass-card p-6">
          <p>Loading master lists...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Master Lists"
        description="Manage the foundational lists that power your inventory system."
      />
      
      <div className="glass-card p-6">
        <Tabs defaultValue="classification" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classification" className="space-y-8 mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Categories</h3>
                <p className="text-sm text-muted-foreground mb-4">Define the categories for your inventory items.</p>
                <ManageOptionsSection
                  optionType="category"
                  initialOptions={categories}
                  addOptionAction={addManagedCategoryOption}
                  deleteOptionAction={deleteManagedCategoryOption}
                />
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Subcategories</h3>
                <p className="text-sm text-muted-foreground mb-4">Define sub-classifications for your inventory items.</p>
                <ManageOptionsSection
                  optionType="subcategory"
                  initialOptions={subcategories}
                  addOptionAction={addManagedSubcategoryOption}
                  deleteOptionAction={deleteManagedSubcategoryOption}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-8 mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Storage Locations</h3>
                <p className="text-sm text-muted-foreground mb-4">Specify general areas where items are stored.</p>
                <ManageOptionsSection
                  optionType="storage_location"
                  initialOptions={storageLocations}
                  addOptionAction={addManagedStorageLocationOption}
                  deleteOptionAction={deleteManagedStorageLocationOption}
                />
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Bin Locations</h3>
                <p className="text-sm text-muted-foreground mb-4">Define specific bins, shelves, or spots.</p>
                <ManageOptionsSection
                  optionType="bin_location"
                  initialOptions={binLocations}
                  addOptionAction={addManagedBinLocationOption}
                  deleteOptionAction={deleteManagedBinLocationOption}
                />
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Rooms</h3>
                <p className="text-sm text-muted-foreground mb-4">Specify rooms or distinct physical areas.</p>
                <ManageOptionsSection
                  optionType="room"
                  initialOptions={rooms}
                  addOptionAction={addManagedRoomOption}
                  deleteOptionAction={deleteManagedRoomOption}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="business" className="space-y-8 mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Vendors</h3>
                <p className="text-sm text-muted-foreground mb-4">Maintain a list of your suppliers or vendors.</p>
                <ManageOptionsSection
                  optionType="vendor"
                  initialOptions={vendors}
                  addOptionAction={addManagedVendorOption}
                  deleteOptionAction={deleteManagedVendorOption}
                />
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Projects</h3>
                <p className="text-sm text-muted-foreground mb-4">List projects for item association.</p>
                <ManageOptionsSection
                  optionType="project"
                  initialOptions={projects}
                  addOptionAction={addManagedProjectOption}
                  deleteOptionAction={deleteManagedProjectOption}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}