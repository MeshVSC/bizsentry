
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
import type { ItemInput } from '@/types/item';
import { notFound } from 'next/navigation';

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const item = await getItemById(id);
  
  if (!item) {
    notFound();
  }

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
