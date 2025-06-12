
import ItemForm from '@/components/inventory/ItemForm';
import PageHeader from '@/components/shared/PageHeader';
import {
  createItem,
  getManagedCategoryOptions, 
  getManagedSubcategoryOptions,
  getManagedStorageLocationOptions, 
  getManagedBinLocationOptions,
  getManagedRoomOptions,
  getManagedVendorOptions,
  getManagedProjectOptions,
} from '@/lib/actions/itemActions';

export default async function AddItemPage() {
  const managedCategories = await getManagedCategoryOptions();
  const managedSubcategories = await getManagedSubcategoryOptions();
  const managedStorageLocations = await getManagedStorageLocationOptions();
  const managedBinLocations = await getManagedBinLocationOptions();
  const managedRooms = await getManagedRoomOptions();
  const managedVendors = await getManagedVendorOptions();
  const managedProjects = await getManagedProjectOptions();

  return (
    <>
      <PageHeader title="Add New Item" description="Fill in the details for the new inventory item." />
      <ItemForm 
        onSubmitAction={createItem}
        isEditing={false} 
        availableCategories={managedCategories}
        availableSubcategories={managedSubcategories}
        availableStorageLocations={managedStorageLocations}
        availableBinLocations={managedBinLocations}
        availableRooms={managedRooms}
        availableVendors={managedVendors}
        availableProjects={managedProjects}
      />
    </>
  );
}
