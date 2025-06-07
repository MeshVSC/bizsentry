
"use server";

import type { Item, ItemInput, ItemStatus } from "@/types/item";
import { revalidatePath } from "next/cache";
import { receiptDataExtraction, type ReceiptDataExtractionInput, type ReceiptDataExtractionOutput } from '@/ai/flows/receipt-data-extraction';
import { supabase } from '@/lib/supabase/client';

// Use this specific admin user ID for all operations
const ADMIN_USER_ID = '047dd250-5c94-44f2-8827-6ff6bff8207c';

async function logAuditAction(
  action_type: string,
  { target_table, target_record_id, details, description }: {
    target_table?: string;
    target_record_id?: string | string[]; // Can be single ID or array for bulk
    details?: any;
    description?: string;
  }
) {
  try {
    const { error } = await supabase.from('audit_log').insert({
      user_id: ADMIN_USER_ID,
      action_type,
      target_table,
      target_record_id: Array.isArray(target_record_id) ? target_record_id.join(', ') : target_record_id, // Store as string if array
      details,
      description,
    });
    if (error) {
      console.error(`[Audit Log Error] Failed to log action '${action_type}':`, error.message, { details, description });
    }
  } catch (e) {
    console.error(`[Audit Log Exception] Exception during logging action '${action_type}':`, e);
  }
}


async function seedAdminUserOptions(optionType: string, defaultOptions: string[]) {
  const { data: existingOptions, error: fetchError } = await supabase
    .from('managed_options')
    .select('name', { count: 'exact' })
    .eq('user_id', ADMIN_USER_ID)
    .eq('type', optionType);

  if (fetchError) {
    // console.error(`[Seed Error] Error fetching options for admin user ${ADMIN_USER_ID}, type ${optionType}: ${fetchError.message}.`);
    return;
  }

  const currentCount = existingOptions?.length || 0;

  if (currentCount === 0) {
    const optionsToInsert = defaultOptions.map(name => ({
      name,
      type: optionType,
      user_id: ADMIN_USER_ID,
    }));

    if (optionsToInsert.length > 0) {
        const { error: insertError } = await supabase
        .from('managed_options')
        .insert(optionsToInsert);

        if (insertError) {
          // console.error(`[Seed Error] Error seeding options for admin user ${ADMIN_USER_ID}, type ${optionType}: ${insertError.message}.`);
        } else {
        // console.log(`[Seed Info] Successfully seeded ${optionsToInsert.length} options for admin user ${ADMIN_USER_ID}, type ${optionType}.`);
        }
    }
  }
}


export interface ItemFilters {
  name?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function getItems(filters?: ItemFilters): Promise<{ items: Item[]; totalPages: number; count: number }> {
  let query = supabase
    .from('items')
    .select('*', { count: 'exact' })
    .eq('user_id', ADMIN_USER_ID);

  if (filters) {
    if (filters.name && filters.name.trim() !== '') {
      query = query.ilike('name', `%${filters.name.trim()}%`);
    }
    if (filters.category && filters.category.trim() !== '') {
      query = query.eq('category', filters.category.trim());
    }
  }

  query = query.order('created_at', { ascending: false });

  const countQuery = query.select('*', { count: 'exact', head: true });
  const { count: totalMatchingCount, error: countError } = await countQuery;


  if (countError) {
    // console.error(`Error fetching items count for admin user ${ADMIN_USER_ID}:`, countError.message);
    return { items: [], totalPages: 0, count: 0 };
  }

  const totalItems = totalMatchingCount || 0;
  let totalPages = 1;

  if (filters?.page && filters?.limit && totalItems > 0) {
    const page = filters.page;
    const limit = filters.limit;
    const startIndex = (page - 1) * limit;
    totalPages = Math.ceil(totalItems / limit);
    query = query.range(startIndex, startIndex + limit - 1);
  } else if (totalItems === 0) {
     return { items: [], totalPages: 0, count: 0 };
  }


  const { data, error: dataError } = await query.select();

  if (dataError) {
    // console.error(`Error fetching items data for admin user ${ADMIN_USER_ID}:`, dataError.message);
    return { items: [], totalPages: 0, count: 0 };
  }

  return { items: (data as Item[]) || [], totalPages, count: totalItems };
}

export async function getItemById(id: string): Promise<Item | { error: string }> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    let message = `Error fetching item by ID '${id}'. DB message: ${error.message}.`;
    // console.error(`getItemById debug: ${message}`, error);
    return { error: message };
  }

  if (!data) {
    const message = `Item with ID '${id}' not found. Query matched 0 rows.`;
    // console.log(`getItemById debug: ${message}`);
    return { error: message };
  }

  if (data.user_id !== ADMIN_USER_ID) {
    const message = `Item with ID '${id}' found, but it does not belong to the admin user (${ADMIN_USER_ID}). Access denied.`;
    // console.warn(`getItemById security: ${message}`);
    return { error: message };
  }

  return data as Item;
}


export async function addItem(itemData: ItemInput): Promise<Item | { error: string }> {
  const now = new Date().toISOString();

  const newItemPayload: Record<string, any> = {
    user_id: ADMIN_USER_ID,
    name: itemData.name,
    description: itemData.description,
    quantity: itemData.quantity,
    category: itemData.category,
    subcategory: itemData.subcategory,
    room: itemData.room,
    vendor: itemData.vendor,
    project: itemData.project,
    msrp: itemData.msrp,
    sku: itemData.sku,
    status: itemData.status,
    original_price: itemData.originalPrice,
    sales_price: itemData.salesPrice,
    receipt_image_url: itemData.receiptImageUrl,
    product_image_url: itemData.productImageUrl,
    product_url: itemData.productUrl,
    purchase_date: itemData.purchaseDate,
    storage_location: itemData.storageLocation,
    bin_location: itemData.binLocation,
    sold_date: itemData.status === 'sold' ? (itemData.soldDate || now) : null,
    in_use_date: itemData.status === 'in use' ? (itemData.inUseDate || now) : null,
    barcode_data: itemData.sku ? `BARCODE-${itemData.sku.substring(0,8).toUpperCase()}` : `BARCODE-${crypto.randomUUID().substring(0,8).toUpperCase()}`,
    qr_code_data: itemData.sku ? `QR-${itemData.sku.toUpperCase()}` : `QR-${crypto.randomUUID().toUpperCase()}`,
  };

  for (const key in newItemPayload) {
    if (newItemPayload[key] === undefined) {
      newItemPayload[key] = null;
    }
  }

  const { data: insertedItem, error } = await supabase
    .from('items')
    .insert([newItemPayload])
    .select()
    .single();

  if (error) {
    let fullErrorMessage = `Failed to add item for admin user ${ADMIN_USER_ID}: ${error.message}.`;
    // console.error("Error in addItem:", fullErrorMessage, "Payload:", newItemPayload);
    return { error: fullErrorMessage };
  }

  if (insertedItem) {
    await logAuditAction('ITEM_CREATED', {
      target_table: 'items',
      target_record_id: insertedItem.id,
      details: { name: insertedItem.name, quantity: insertedItem.quantity, status: insertedItem.status },
      description: `Admin created item '${insertedItem.name}' (ID: ${insertedItem.id}).`
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return insertedItem as Item;
  }
  return { error: "Failed to add item for an unknown reason (no data returned)." };
}

export async function updateItem(id: string, itemData: Partial<ItemInput>): Promise<Item | { error: string } | undefined> {
    const currentItemResult = await getItemById(id);
    if ('error' in currentItemResult) {
        return { error: `Cannot update item. Pre-check failed: ${currentItemResult.error}` };
    }

    const updatePayload: { [key: string]: any } = {};
    const now = new Date().toISOString();

    const directFields: (keyof ItemInput)[] = [
        'name', 'description', 'quantity', 'category', 'subcategory', 'room',
        'vendor', 'project', 'msrp', 'sku'
    ];
    directFields.forEach(field => {
        if (itemData.hasOwnProperty(field)) {
            updatePayload[field] = itemData[field] === undefined ? null : itemData[field];
        }
    });

    if (itemData.hasOwnProperty('originalPrice')) updatePayload.original_price = itemData.originalPrice === undefined ? null : itemData.originalPrice;
    if (itemData.hasOwnProperty('salesPrice')) updatePayload.sales_price = itemData.salesPrice === undefined ? null : itemData.salesPrice;
    if (itemData.hasOwnProperty('receiptImageUrl')) updatePayload.receipt_image_url = itemData.receiptImageUrl === undefined || itemData.receiptImageUrl === "" ? null : itemData.receiptImageUrl;
    if (itemData.hasOwnProperty('productImageUrl')) updatePayload.product_image_url = itemData.productImageUrl === undefined || itemData.productImageUrl === "" ? null : itemData.productImageUrl;
    if (itemData.hasOwnProperty('productUrl')) updatePayload.product_url = itemData.productUrl === undefined || itemData.productUrl === "" ? null : itemData.productUrl;
    if (itemData.hasOwnProperty('purchaseDate')) updatePayload.purchase_date = itemData.purchaseDate === undefined ? null : itemData.purchaseDate;
    if (itemData.hasOwnProperty('storageLocation')) updatePayload.storage_location = itemData.storageLocation === undefined ? null : itemData.storageLocation;
    if (itemData.hasOwnProperty('binLocation')) updatePayload.bin_location = itemData.binLocation === undefined ? null : itemData.binLocation;

    const currentItemStatus = (currentItemResult as Item).status;
    if (itemData.status && itemData.status !== currentItemStatus) {
        updatePayload.status = itemData.status;
        updatePayload.sold_date = itemData.status === 'sold' ? (itemData.soldDate || now) : null;
        updatePayload.in_use_date = itemData.status === 'in use' ? (itemData.inUseDate || now) : null;
        if (itemData.status === 'in stock') {
            updatePayload.sold_date = null;
            updatePayload.in_use_date = null;
        }
    } else if (itemData.status === currentItemStatus) { 
        if (itemData.hasOwnProperty('soldDate')) updatePayload.sold_date = itemData.soldDate === undefined ? null : itemData.soldDate;
        if (itemData.hasOwnProperty('inUseDate')) updatePayload.in_use_date = itemData.inUseDate === undefined ? null : itemData.inUseDate;
    } else { 
        if (itemData.hasOwnProperty('status')) updatePayload.status = itemData.status;
        if (itemData.hasOwnProperty('soldDate')) updatePayload.sold_date = itemData.soldDate === undefined ? null : itemData.soldDate;
        if (itemData.hasOwnProperty('inUseDate')) updatePayload.in_use_date = itemData.inUseDate === undefined ? null : itemData.inUseDate;
    }
    
    updatePayload.updated_at = now;

    for (const key in updatePayload) {
      if (updatePayload[key] === undefined) {
        updatePayload[key] = null;
      }
    }
    
    const { data: updatedItem, error: updateError } = await supabase
        .from('items')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', ADMIN_USER_ID)
        .select()
        .single();

    if (updateError) {
        let fullErrorMessage = `Failed to update item ID '${id}' for admin user ${ADMIN_USER_ID}: ${updateError.message}.`;
        return { error: fullErrorMessage };
    }

    if (!updatedItem) {
        return { error: `Failed to update item ID '${id}'. No data returned from Supabase after update, but no explicit error. Check database logs.` };
    }

    await logAuditAction('ITEM_UPDATED', {
      target_table: 'items',
      target_record_id: updatedItem.id,
      details: { updatedFields: Object.keys(itemData), name: updatedItem.name }, // Log which fields were included in the update payload
      description: `Admin updated item '${updatedItem.name}' (ID: ${updatedItem.id}).`
    });

    revalidatePath("/inventory", "layout");
    revalidatePath(`/inventory/${id}`, "layout");
    revalidatePath(`/inventory/${id}/edit`, "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return updatedItem as Item;
}


export async function deleteItem(id: string): Promise<boolean | { error: string }> {
  const itemCheck = await getItemById(id);
  if ('error' in itemCheck) {
      return { error: `Cannot delete item. Pre-check failed: ${itemCheck.error}` };
  }
  const itemName = (itemCheck as Item).name; // Get name for logging

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
    .eq('user_id', ADMIN_USER_ID); 

  if (error) {
    // console.error(`Error deleting item ${id} for admin user ${ADMIN_USER_ID}:`, error);
    return { error: error.message };
  }

  await logAuditAction('ITEM_DELETED', {
    target_table: 'items',
    target_record_id: id,
    details: { name: itemName },
    description: `Admin deleted item '${itemName}' (ID: ${id}).`
  });

  revalidatePath("/inventory", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/analytics", "layout");
  return true;
}

export async function processReceiptImage(receiptImage: string): Promise<ReceiptDataExtractionOutput | { error: string }> {
  try {
    const input: ReceiptDataExtractionInput = { receiptImage };
    const extractedData = await receiptDataExtraction(input);
    if (!extractedData.items) {
      return { ...extractedData, items: [] };
    }
    return extractedData;
  } catch (error) {
    // console.error("Error processing receipt:", error);
    return { error: "Failed to extract data from receipt. Please try again or enter manually." };
  }
}

export async function updateItemStatus(id: string, newStatus: ItemStatus): Promise<Item | { error: string } | undefined> {
    const currentItemResult = await getItemById(id); 
    if (!currentItemResult || 'error' in currentItemResult) {
      return { error: (currentItemResult as {error: string})?.error || "Item not found." };
    }

    const currentItem = currentItemResult as Item;
    const oldStatus = currentItem.status;
    const itemName = currentItem.name;

    const updatePayload: { [key: string]: any } = { status: newStatus };
    const now = new Date().toISOString();

    if (newStatus === 'sold') {
      updatePayload.sold_date = currentItem.sold_date || now;
      updatePayload.in_use_date = null;
    } else if (newStatus === 'in use') {
      updatePayload.in_use_date = currentItem.in_use_date || now;
      updatePayload.sold_date = null;
    } else { // 'in stock'
      updatePayload.sold_date = null;
      updatePayload.in_use_date = null;
    }
    updatePayload.updated_at = now;

    const { data: updatedItem, error } = await supabase
      .from('items')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', ADMIN_USER_ID) 
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    if (updatedItem) {
      await logAuditAction('ITEM_STATUS_CHANGED', {
        target_table: 'items',
        target_record_id: updatedItem.id,
        details: { name: itemName, oldStatus: oldStatus, newStatus: updatedItem.status },
        description: `Admin changed status of item '${itemName}' (ID: ${updatedItem.id}) from '${oldStatus}' to '${updatedItem.status}'.`
      });
      revalidatePath("/inventory", "layout");
      revalidatePath(`/inventory/${id}`, "layout");
      revalidatePath("/dashboard", "layout");
      revalidatePath("/analytics", "layout");
      return updatedItem as Item;
    }
    return { error: "Failed to update item status or item not found (no data returned)." };
}

export async function bulkDeleteItems(itemIds: string[]): Promise<{ success: boolean; message?: string }> {
  if (itemIds.length === 0) return { success: false, message: "No items selected."};

  const { error, count } = await supabase
    .from('items')
    .delete({ count: 'exact' })
    .in('id', itemIds)
    .eq('user_id', ADMIN_USER_ID);

  if (error) {
    return { success: false, message: error.message };
  }
  if (count && count > 0) {
    await logAuditAction('ITEMS_BULK_DELETED', {
        target_table: 'items',
        details: { itemCount: count, itemIds: itemIds },
        description: `Admin bulk deleted ${count} item(s). IDs: ${itemIds.join(', ')}.`
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return { success: true, message: `${count} item(s) for admin user ${ADMIN_USER_ID} deleted successfully.` };
  }
  return { success: false, message: `No matching items for admin user ${ADMIN_USER_ID} found to delete or none selected.` };
}

export async function bulkUpdateItemStatus(itemIds: string[], newStatus: ItemStatus): Promise<{ success: boolean; message?: string }> {
  if (itemIds.length === 0) return { success: false, message: "No items selected."};

  const updatePayload: { [key: string]: any } = { status: newStatus };
  const now = new Date().toISOString();

  if (newStatus === 'sold') {
    updatePayload.sold_date = now;
    updatePayload.in_use_date = null;
  } else if (newStatus === 'in use') {
    updatePayload.in_use_date = now;
    updatePayload.sold_date = null;
  } else { // 'in stock'
    updatePayload.sold_date = null;
    updatePayload.in_use_date = null;
  }
  updatePayload.updated_at = now;

  const { error, count } = await supabase
    .from('items')
    .update(updatePayload)
    .in('id', itemIds)
    .eq('user_id', ADMIN_USER_ID)
    .select({count: 'exact'});

  if (error) {
    return { success: false, message: error.message };
  }

  const updatedCount = count || 0;

  if (updatedCount > 0) {
    await logAuditAction('ITEMS_BULK_STATUS_CHANGED', {
        target_table: 'items',
        details: { itemCount: updatedCount, itemIds: itemIds, newStatus: newStatus },
        description: `Admin bulk updated status of ${updatedCount} item(s) to '${newStatus}'. IDs: ${itemIds.join(', ')}.`
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    itemIds.forEach(id => revalidatePath(`/inventory/${id}`, "layout"));
    return { success: true, message: `${updatedCount} item(s) for admin user ${ADMIN_USER_ID} status updated to ${newStatus}.` };
  }
  return { success: false, message: `No matching items for admin user ${ADMIN_USER_ID} found to update or none selected.` };
}

export async function getUniqueCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('items')
    .select('category')
    .eq('user_id', ADMIN_USER_ID);

  if (error) {
    // console.error(`Error fetching unique categories for admin user ${ADMIN_USER_ID}:`, error);
    return [];
  }
  if (!data) return [];

  const categories = Array.from(new Set(data.map(item => item.category).filter(Boolean as (value: any) => value is string))).sort();
  return categories;
}

const defaultManagedCategories = ['Electronics', 'Accessories', 'Office Supplies', 'Furniture', 'Appliances', 'Software', 'Miscellaneous', 'Lighting'];
const defaultManagedSubcategories = ['Peripherals', 'Computer Accessories', 'Cables', 'Lighting', 'Kitchen Appliances', 'Productivity Tools', 'Decor', 'Desks', 'Desk Lamps'];
const defaultManagedStorageLocations = ['Warehouse A', 'Warehouse B', 'Office Shelf', 'Storage Closet', 'Remote Site', 'Main Stockroom', 'Showroom', 'Kitchen Area', 'Drawer C', 'Pantry', 'Drawer B'];
const defaultManagedBinLocations = ['A-01', 'A-02', 'A-03', 'B-01', 'C-01', 'Shelf A1', 'Shelf A2', 'Shelf 1-A', 'Shelf 1-B', 'Shelf 1-C', 'Shelf 2-A', 'Drawer X', 'Pallet 5', 'Section 1', 'Section 2', 'Bin 1', 'Bin 3', 'Display A', 'Counter Top'];
const defaultManagedRooms = ['Main Office', 'Tech Closet', 'Server Room', 'Conference Room A', 'Break Room', 'Storage Unit 1'];
const defaultManagedVendors = ['TechSupply Co.', 'Keychron', 'Accessory King', 'StandUp Inc.', 'Lights R Us', 'Office Essentials', 'Generic Supplier'];
const defaultManagedProjects = ['Office Upgrade', 'Gaming Setup', 'General Stock', 'Ergonomics Improvement', 'New Office Setup', 'Client Project X', 'Internal R&D'];


export type OptionType = 'category' | 'subcategory' | 'storage_location' | 'bin_location' | 'room' | 'vendor' | 'project';

const optionTypeToDefaultsMap: Record<OptionType, string[]> = {
  'category': defaultManagedCategories,
  'subcategory': defaultManagedSubcategories,
  'storage_location': defaultManagedStorageLocations,
  'bin_location': defaultManagedBinLocations,
  'room': defaultManagedRooms,
  'vendor': defaultManagedVendors,
  'project': defaultManagedProjects,
};
const optionTypeToSingularName: Record<OptionType, string> = {
    'category': 'Category',
    'subcategory': 'Subcategory',
    'storage_location': 'Storage Location',
    'bin_location': 'Bin Location',
    'room': 'Room',
    'vendor': 'Vendor',
    'project': 'Project',
};


async function getManagedOptions(optionType: OptionType): Promise<string[]> {
  await seedAdminUserOptions(optionType, optionTypeToDefaultsMap[optionType]);

  const { data, error } = await supabase
    .from('managed_options')
    .select('name')
    .eq('type', optionType)
    .eq('user_id', ADMIN_USER_ID) 
    .order('name', { ascending: true });

  if (error) {
    // console.error(`Error fetching managed options for admin user ${ADMIN_USER_ID}, type ${optionType}:`, error);
    return [];
  }
  return data ? data.map(opt => opt.name) : [];
}

export async function getManagedCategoryOptions(): Promise<string[]> { return getManagedOptions('category'); }
export async function getManagedSubcategoryOptions(): Promise<string[]> { return getManagedOptions('subcategory'); }
export async function getManagedStorageLocationOptions(): Promise<string[]> { return getManagedOptions('storage_location'); }
export async function getManagedBinLocationOptions(): Promise<string[]> { return getManagedOptions('bin_location'); }
export async function getManagedRoomOptions(): Promise<string[]> { return getManagedOptions('room'); }
export async function getManagedVendorOptions(): Promise<string[]> { return getManagedOptions('vendor'); }
export async function getManagedProjectOptions(): Promise<string[]> { return getManagedOptions('project'); }


async function addManagedOption(name: string, optionType: OptionType): Promise<{ success: boolean; message?: string; options?: string[] }> {
  const singularName = optionTypeToSingularName[optionType];

  if (!name || name.trim() === "") {
    return { success: false, message: `${singularName} name cannot be empty.` };
  }

  const { data: existing, error: selectError } = await supabase
    .from('managed_options')
    .select('id')
    .eq('type', optionType)
    .ilike('name', name.trim())
    .eq('user_id', ADMIN_USER_ID) 
    .limit(1)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { 
      return { success: false, message: `Error checking existing ${singularName}: ${selectError.message}` };
  }
  if (existing) {
    return { success: false, message: `${singularName} "${name.trim()}" already exists for this user.` };
  }

  const { error: insertError } = await supabase
    .from('managed_options')
    .insert({
      name: name.trim(),
      type: optionType,
      user_id: ADMIN_USER_ID, 
    });

  if (insertError) {
    let fullErrorMessage = `Failed to add ${singularName} for admin user ${ADMIN_USER_ID}: ${insertError.message}.`;
    return { success: false, message: fullErrorMessage };
  }

  const updatedOptions = await getManagedOptions(optionType);
  const settingsPagePath = `/settings/${optionType.replace(/_/g, '-') + 's'}`;
  revalidatePath(settingsPagePath, "page");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return { success: true, message: `${singularName} "${name.trim()}" added.`, options: updatedOptions };
}

async function deleteManagedOption(name: string, optionType: OptionType): Promise<{ success: boolean; message?: string; options?: string[] }> {
  const singularName = optionTypeToSingularName[optionType];

  const { error, count } = await supabase
    .from('managed_options')
    .delete({ count: 'exact' })
    .eq('type', optionType)
    .eq('name', name)
    .eq('user_id', ADMIN_USER_ID); 

  if (error) {
    return { success: false, message: `Failed to delete ${singularName}: ${error.message}` };
  }

  if (count === 0) {
     return { success: false, message: `${singularName} "${name}" not found for deletion for this user.` };
  }

  const updatedOptions = await getManagedOptions(optionType);
  const settingsPagePath = `/settings/${optionType.replace(/_/g, '-') + 's'}`;
  revalidatePath(settingsPagePath, "page");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return { success: true, message: `${singularName} "${name}" deleted.`, options: updatedOptions };
}

export async function addManagedCategoryOption(name: string) { return addManagedOption(name, 'category'); }
export async function deleteManagedCategoryOption(name: string) { return deleteManagedOption(name, 'category'); }
export async function addManagedSubcategoryOption(name: string) { return addManagedOption(name, 'subcategory'); }
export async function deleteManagedSubcategoryOption(name: string) { return deleteManagedOption(name, 'subcategory'); }
export async function addManagedStorageLocationOption(name: string) { return addManagedOption(name, 'storage_location'); }
export async function deleteManagedStorageLocationOption(name: string) { return deleteManagedOption(name, 'storage_location'); }
export async function addManagedBinLocationOption(name: string) { return addManagedOption(name, 'bin_location'); }
export async function deleteManagedBinLocationOption(name: string) { return deleteManagedOption(name, 'bin_location'); }
export async function addManagedRoomOption(name: string) { return addManagedOption(name, 'room'); }
export async function deleteManagedRoomOption(name: string) { return deleteManagedOption(name, 'room'); }
export async function addManagedVendorOption(name: string) { return addManagedOption(name, 'vendor'); }
export async function deleteManagedVendorOption(name: string) { return deleteManagedOption(name, 'vendor'); }
export async function addManagedProjectOption(name: string) { return addManagedOption(name, 'project'); }
export async function deleteManagedProjectOption(name: string) { return deleteManagedOption(name, 'project'); }

export async function bulkDeleteManagedOptions(names: string[], optionType: OptionType): Promise<{ success: boolean; message?: string; count?: number }> {
  const singularName = optionTypeToSingularName[optionType];
  if (!names || names.length === 0) {
    return { success: false, message: `No ${singularName.toLowerCase()}s selected for deletion.` };
  }

  const { error, count } = await supabase
    .from('managed_options')
    .delete({ count: 'exact' })
    .in('name', names)
    .eq('type', optionType)
    .eq('user_id', ADMIN_USER_ID); 

  if (error) {
    return { success: false, message: `Failed to delete ${singularName.toLowerCase()}s: ${error.message}` };
  }

  const settingsPagePath = `/settings/${optionType.replace(/_/g, '-') + 's'}`;
  revalidatePath(settingsPagePath, "page");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");

  if (count !== null && count > 0) {
    return { success: true, message: `${count} ${singularName.toLowerCase()}(s) deleted successfully for this user.`, count };
  } else if (count === 0) {
    return { success: false, message: `No matching ${singularName.toLowerCase()}s found for deletion for this user.` };
  }
  return { success: false, message: `An issue occurred while deleting ${singularName.toLowerCase()}s (count: ${count}).` };
}


export interface BulkImportResult {
  successCount: number;
  errorCount: number;
  errors: { rowNumber: number; message: string; rowData: string }[];
}

export async function bulkImportItems(csvFileContent: string): Promise<BulkImportResult> {
  const lines = csvFileContent.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) {
    return { successCount: 0, errorCount: 0, errors: [{ rowNumber: 0, message: "CSV file is empty or contains only a header.", rowData: "" }] };
  }

  const headerLine = lines[0];
  const expectedHeaders = [
    "name", "quantity", "purchasePrice", "salesPrice", "msrp", "sku",
    "category", "subcategory", "description", "vendor", "storageLocation", "binLocation", "room", "project",
    "purchaseDate", "productImageUrl", "receiptImageUrl", "productUrl", "status"
  ];
  const actualHeaders = headerLine.split(',').map(h => h.trim().toLowerCase());
  const headerMap: { [key: string]: number } = {};
  expectedHeaders.forEach(expectedHeader => {
    const index = actualHeaders.indexOf(expectedHeader.toLowerCase());
    if (index !== -1) {
      headerMap[expectedHeader] = index;
    }
  });

  if (headerMap["name"] === undefined || headerMap["quantity"] === undefined) {
      return {
          successCount: 0,
          errorCount: lines.length -1,
          errors: [{ rowNumber: 1, message: "CSV must contain 'name' and 'quantity' columns.", rowData: headerLine }]
      };
  }

  const results: BulkImportResult = { successCount: 0, errorCount: 0, errors: [] };
  const importedItemIds: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());

    const getValue = (headerName: string): string | undefined => {
        const index = headerMap[headerName];
        return (index !== undefined && index < values.length) ? values[index] : undefined;
    }

    try {
      const name = getValue("name");
      if (!name) {
        results.errors.push({ rowNumber, message: "Item name is required.", rowData: line });
        results.errorCount++;
        continue;
      }

      const quantityStr = getValue("quantity");
      const quantity = parseInt(quantityStr || "", 10);
      if (isNaN(quantity) || quantity < 0) {
        results.errors.push({ rowNumber, message: "Invalid quantity. Must be a non-negative number.", rowData: line });
        results.errorCount++;
        continue;
      }

      const originalPriceStr = getValue("purchasePrice");
      const salesPriceStr = getValue("salesPrice");
      const msrpStr = getValue("msrp");
      const purchaseDateStr = getValue("purchaseDate");
      const statusStr = getValue("status")?.toLowerCase() as ItemStatus | undefined;

      const itemInput: ItemInput = {
        name,
        quantity,
        originalPrice: originalPriceStr && originalPriceStr !== "" ? parseFloat(originalPriceStr) : undefined,
        salesPrice: salesPriceStr && salesPriceStr !== "" ? parseFloat(salesPriceStr) : undefined,
        msrp: msrpStr && msrpStr !== "" ? parseFloat(msrpStr) : undefined,
        sku: getValue("sku") || undefined,
        category: getValue("category") || undefined,
        subcategory: getValue("subcategory") || undefined,
        description: getValue("description") || undefined,
        vendor: getValue("vendor") || undefined,
        storageLocation: getValue("storageLocation") || undefined,
        binLocation: getValue("binLocation") || undefined,
        room: getValue("room") || undefined,
        project: getValue("project") || undefined,
        purchaseDate: purchaseDateStr && purchaseDateStr !== "" ? new Date(purchaseDateStr).toISOString() : undefined,
        productImageUrl: getValue("productImageUrl") || undefined,
        receiptImageUrl: getValue("receiptImageUrl") || undefined,
        productUrl: getValue("productUrl") || undefined,
        status: ['in stock', 'in use', 'sold'].includes(statusStr || '') ? (statusStr || 'in stock') : 'in stock',
      };

      if (itemInput.originalPrice !== undefined && isNaN(itemInput.originalPrice)) itemInput.originalPrice = undefined;
      if (itemInput.salesPrice !== undefined && isNaN(itemInput.salesPrice)) itemInput.salesPrice = undefined;
      if (itemInput.msrp !== undefined && isNaN(itemInput.msrp)) itemInput.msrp = undefined;
      if (itemInput.purchaseDate && (itemInput.purchaseDate.includes("Invalid Date") || !purchaseDateStr)) {
        itemInput.purchaseDate = undefined;
      }

      const addResult = await addItem(itemInput); 
      if ('error' in addResult) {
        results.errorCount++;
        results.errors.push({ rowNumber, message: addResult.error, rowData: line });
      } else {
        results.successCount++;
        if (addResult.id) importedItemIds.push(addResult.id); // addItem already logs audit for single items
      }
    } catch (error: any) {
      results.errorCount++;
      results.errors.push({ rowNumber, message: error.message || "Failed to add item.", rowData: line });
    }
  }

  // addItem already logs individual creations. 
  // If we want a specific "BULK_IMPORT_COMPLETED" log, we could add it here.
  // For now, relying on individual addItem logs.

  if (results.successCount > 0) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
  }
  return results;
}
    
