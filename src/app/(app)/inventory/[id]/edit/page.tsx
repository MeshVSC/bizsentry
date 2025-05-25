
import ItemForm from '@/components/inventory/ItemForm';
import PageHeader from '@/components/shared/PageHeader';
import { getItemById, updateItem, getUniqueCategories, getStorageLocationOptions, getBinLocationOptions } from '@/lib/actions/itemActions';
import type { Item, ItemInput } from '@/types/item';
import { notFound } from 'next/navigation';

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const item = await getItemById(params.id);
  const uniqueCategories = await getUniqueCategories();
  const storageLocations = await getStorageLocationOptions();
  const binLocations = await getBinLocationOptions();

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
        availableCategories={uniqueCategories}
        availableStorageLocations={storageLocations}
        availableBinLocations={binLocations}
      />
    </>
  );
}

