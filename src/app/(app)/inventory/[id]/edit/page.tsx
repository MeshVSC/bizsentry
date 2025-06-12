import ItemForm from '@/components/inventory/ItemForm';
import PageHeader from '@/components/shared/PageHeader';
import {
  getItemById,
  updateItem,
  getManagedCategoryOptions,
  getManagedSubcategoryOptions,
  getManagedStorageLocationOptions,
  getManagedBinLocationOptions,
  getManagedRoomOptions,
  getManagedVendorOptions,
  getManagedProjectOptions,
} from '@/lib/actions/itemActions';
import type { Item, ItemInput } from '@/types/item';
import { notFound } from 'next/navigation';

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params before using its properties
  const resolvedParams = await params;
  const id = typeof resolvedParams.id === 'string' ? resolvedParams.id : String(resolvedParams.id);
  const itemResult = await getItemById(id);

  if (!itemResult || 'error' in itemResult) {
    return <div>Error loading item</div>;
  }

  const item = itemResult as Item; // Rename itemResult to item here

  const managedCategories = await getManagedCategoryOptions();
  const managedSubcategories = await getManagedSubcategoryOptions();
  const managedStorageLocations = await getManagedStorageLocationOptions();
  const managedBinLocations = await getManagedBinLocationOptions();
  const managedRooms = await getManagedRoomOptions();
  const managedVendors = await getManagedVendorOptions();
  const managedProjects = await getManagedProjectOptions();

  const updateItemWithId = async (data: ItemInput) => {
    "use server";
    return updateItem(id, data);
  };

  return (
    <>
      <PageHeader title="Edit Item" description={`Update details for ${item.name}.`} />
      <ItemForm 
        item={item} 
        onSubmitAction={updateItemWithId} 
        isEditing={true} 
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
