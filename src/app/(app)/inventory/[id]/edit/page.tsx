import { getItemById, updateItem, getManagedCategoryOptions, getManagedSubcategoryOptions, getManagedStorageLocationOptions, getManagedBinLocationOptions, getManagedRoomOptions, getManagedVendorOptions, getManagedProjectOptions } from '@/lib/actions/itemActions'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import ItemForm from '@/components/inventory/ItemForm'
import type { ItemInput } from '@/types/item'

export default async function EditItemPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params
  const id = resolvedParams.id
  
  const item = await getItemById(id)
  
  if (!item || 'error' in item) {
    notFound()
  }

  // Get managed options for the form
  const managedCategories = await getManagedCategoryOptions()
  const managedSubcategories = await getManagedSubcategoryOptions()
  const managedStorageLocations = await getManagedStorageLocationOptions()
  const managedBinLocations = await getManagedBinLocationOptions()
  const managedRooms = await getManagedRoomOptions()
  const managedVendors = await getManagedVendorOptions()
  const managedProjects = await getManagedProjectOptions()

  // Create update function that includes the item ID
  const updateItemAction = async (itemData: Partial<ItemInput>) => {
    'use server'
    return await updateItem(id, itemData)
  }

  return (
    <>
      <PageHeader 
        title="Edit Item" 
        description={`Edit details for ${item.name}`} 
      />
      <ItemForm 
        item={item}
        onSubmitAction={updateItemAction}
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
  )
}
