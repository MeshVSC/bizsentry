
import ItemForm from '@/components/inventory/ItemForm';
import PageHeader from '@/components/shared/PageHeader';
import { getItemById, updateItem } from '@/lib/actions/itemActions';
import type { Item, ItemInput } from '@/types/item';
import { notFound } from 'next/navigation';

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const item = await getItemById(params.id);

  if (!item) {
    notFound();
  }

  const updateItemWithId = async (data: ItemInput) => {
    "use server";
    // The 'id' from params needs to be passed to updateItem
    // The 'data' received by updateItemAction in ItemForm needs to be Partial<ItemInput>
    // but here updateItem expects full ItemInput because it creates a new Item.
    // The actual updateItem function in itemActions.ts should handle Partial<Item> correctly.
    return updateItem(params.id, data);
  };


  return (
    <>
      <PageHeader title="Edit Item" description={`Update details for ${item.name}.`} />
      <ItemForm item={item} onSubmitAction={updateItemWithId} isEditing={true} />
    </>
  );
}
