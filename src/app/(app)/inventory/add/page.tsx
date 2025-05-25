
import ItemForm from '@/components/inventory/ItemForm';
import PageHeader from '@/components/shared/PageHeader';
import { addItem, getUniqueCategories } from '@/lib/actions/itemActions';

export default async function AddItemPage() {
  const uniqueCategories = await getUniqueCategories();
  return (
    <>
      <PageHeader title="Add New Item" description="Fill in the details for the new inventory item." />
      <ItemForm onSubmitAction={addItem} isEditing={false} availableCategories={uniqueCategories} />
    </>
  );
}
