
import ItemForm from '@/components/inventory/ItemForm';
import PageHeader from '@/components/shared/PageHeader';
import { 
  addItem, 
  getManagedCategoryOptions, 
  getManagedStorageLocationOptions, 
  getManagedBinLocationOptions 
} from '@/lib/actions/itemActions';

export default async function AddItemPage() {
  const managedCategories = await getManagedCategoryOptions();
  const managedStorageLocations = await getManagedStorageLocationOptions();
  const managedBinLocations = await getManagedBinLocationOptions();

  return (
    <>
      <PageHeader title="Add New Item" description="Fill in the details for the new inventory item." />
      <ItemForm 
        onSubmitAction={addItem} 
        isEditing={false} 
        availableCategories={managedCategories}
        availableStorageLocations={managedStorageLocations}
        availableBinLocations={managedBinLocations}
      />
    </>
  );
}
