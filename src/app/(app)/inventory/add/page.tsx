
import ItemForm from '@/components/inventory/ItemForm';
import PageHeader from '@/components/shared/PageHeader';
import { addItem } from '@/lib/actions/itemActions';

export default function AddItemPage() {
  return (
    <>
      <PageHeader title="Add New Item" description="Fill in the details for the new inventory item." />
      <ItemForm onSubmitAction={addItem} isEditing={false} />
    </>
  );
}
