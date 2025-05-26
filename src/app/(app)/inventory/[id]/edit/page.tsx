
import ItemForm from '@/components/inventory/ItemForm';
import PageHeader from '@/components/shared/PageHeader';
import { 
  getItemById, 
  updateItem, 
  getManagedCategoryOptions, 
  getManagedStorageLocationOptions, 
  getManagedBinLocationOptions 
} from '@/lib/actions/itemActions';
import type { ItemInput } from '@/types/item';
import { notFound } from 'next/navigation';

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const item = await getItemById(params.id);
  const managedCategories = await getManagedCategoryOptions();
  const managedStorageLocations = await getManagedStorageLocationOptions();
  const managedBinLocations = await getManagedBinLocationOptions();

  if (!item) {
    notFound();
  }

  const updateItemWithId = async (data: ItemInput) => {
    "use server";
    return updateItem(params.id, data);
  };

  return (
    <>
      <PageHeader title="Edit Item" description={`Update details for ${item.name}.`} />
      <ItemForm 
        item={item} 
        onSubmitAction={updateItemWithId} 
        isEditing={true} 
        availableCategories={managedCategories}
        availableStorageLocations={managedStorageLocations}
        availableBinLocations={managedBinLocations}
      />
    </>
  );
}
