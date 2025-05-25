
import ItemForm from '@/components/inventory/ItemForm';
import PageHeader from '@/components/shared/PageHeader';
import { addItem, getUniqueCategories, getStorageLocationOptions, getBinLocationOptions } from '@/lib/actions/itemActions';

export default async function AddItemPage() {
  const uniqueCategories = await getUniqueCategories();
  const storageLocations = await getStorageLocationOptions();
  const binLocations = await getBinLocationOptions();

  return (
    <>
      <PageHeader title="Add New Item" description="Fill in the details for the new inventory item." />
      <ItemForm 
        onSubmitAction={addItem} 
        isEditing={false} 
        availableCategories={uniqueCategories}
        availableStorageLocations={storageLocations}
        availableBinLocations={binLocations}
      />
    </>
  );
}

