
"use server";

import type { Item, ItemInput, ItemStatus } from "@/types/item";
import { revalidatePath } from "next/cache";
import { receiptDataExtraction, type ReceiptDataExtractionInput, type ReceiptDataExtractionOutput } from '@/ai/flows/receipt-data-extraction';
import { supabase } from '@/lib/supabase/client'; // Import the shared Supabase client

// Managed options are now stored in Supabase 'managed_options' table, associated with user_id

// Helper function to seed options for a user if they don't exist
async function seedUserOptions(userId: string, optionType: string, defaultOptions: string[]) {
  const { data: existingOptions, error: fetchError } = await supabase
    .from('managed_options')
    .select('name')
    .eq('user_id', userId)
    .eq('type', optionType);

  if (fetchError) {
    console.error(`Error fetching existing ${optionType} for user ${userId}:`, fetchError);
    return; // Don't proceed with seeding if fetch fails
  }

  if (existingOptions && existingOptions.length === 0) {
    // No options of this type exist for the user, so seed them
    const optionsToInsert = defaultOptions.map(name => ({
      name,
      type: optionType,
      user_id: userId,
    }));

    const { error: insertError } = await supabase
      .from('managed_options')
      .insert(optionsToInsert);

    if (insertError) {
      console.error(`Error seeding ${optionType} for user ${userId}:`, insertError);
    } else {
      console.log(`Successfully seeded ${optionType} for user ${userId}`);
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
  const { data: { user } } = await supabase.auth.getUser(); // RLS relies on auth.uid()
  if (!user && process.env.NEXT_PUBLIC_USE_SUPABASE_AUTH === 'false') { // Check if custom auth is active
      // For custom auth, RLS won't work with auth.uid().
      // We'd need to pass user_id from custom session, or have broader RLS for service key.
      // This part needs adjustment based on final auth strategy for items if not using Supabase Auth.
      // For now, assuming custom auth might not have items linked to a user_id or RLS is more open.
      // If items ARE linked to user_id, getCurrentUser() from custom auth and its ID is needed here.
      console.warn("getItems: Custom auth in use, RLS based on auth.uid() may not apply. Ensure items are fetched correctly for the custom user.");
  }


  let query = supabase
    .from('items')
    .select('*', { count: 'exact' });

  // If using custom auth AND items are linked via user_id, you'd need this:
  // const customCurrentUser = await import('@/lib/actions/userActions').then(m => m.getCurrentUser());
  // if (customCurrentUser) {
  //   query = query.eq('user_id', customCurrentUser.id);
  // } else if (process.env.NEXT_PUBLIC_USE_SUPABASE_AUTH === 'false') {
  //   console.error("getItems: Custom auth active but no current user found. Cannot filter items by user.");
  //   return { items: [], totalPages: 0, count: 0 };
  // }
  // If Supabase Auth is used, RLS policy (auth.uid() = user_id) handles this automatically.

  if (filters) {
    if (filters.name && filters.name.trim() !== '') {
      query = query.ilike('name', `%${filters.name.trim()}%`);
    }
    if (filters.category && filters.category.trim() !== '') {
      query = query.eq('category', filters.category.trim());
    }
  }

  query = query.order('created_at', { ascending: false });
  
  const { count: totalMatchingCount, error: countError } = await query;

  if (countError) {
    console.error("Error fetching item count:", countError);
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

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching items:", error);
    return { items: [], totalPages: 0, count: 0 };
  }

  return { items: (data as Item[]) || [], totalPages, count: totalItems };
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single(); 

  if (error) {
    console.error("Error fetching item by ID:", error);
    return undefined;
  }
  return data as Item | undefined;
}

export async function addItem(itemData: ItemInput): Promise<Item | { error: string }> {
  // Determine user_id based on auth system
  let userIdToAdd: string | undefined;
  const customUserModule = await import('@/lib/actions/userActions');
  const customCurrentUser = await customUserModule.getCurrentUser();
  if (customCurrentUser) {
    userIdToAdd = customCurrentUser.id;
  } else {
    return { error: "User not authenticated" };
  }

  if (!userIdToAdd) {
    return { error: "User not authenticated or user ID could not be determined." };
  }

  const now = new Date().toISOString();
  const newItemPayload: any = {
    ...itemData,
    user_id: userIdToAdd,
    original_price: itemData.originalPrice,
    sales_price: itemData.salesPrice,
    receipt_image_url: itemData.receiptImageUrl,
    product_image_url: itemData.productImageUrl,
    product_url: itemData.productUrl,
    purchase_date: itemData.purchaseDate,
    sold_date: itemData.status === 'sold' ? (itemData.soldDate || now) : undefined,
    in_use_date: itemData.status === 'in use' ? (itemData.inUseDate || now) : undefined,
    storage_location: itemData.storageLocation,
    bin_location: itemData.binLocation,
    barcode_data: itemData.sku ? `BARCODE-${itemData.sku.substring(0,8).toUpperCase()}` : `BARCODE-${crypto.randomUUID().substring(0,8).toUpperCase()}`,
    qr_code_data: itemData.sku ? `QR-${itemData.sku.toUpperCase()}` : `QR-${crypto.randomUUID().toUpperCase()}`,
    // ensure created_at and updated_at are not part of input payload if DB defaults them
  };
  
  // Remove explicitly passed created_at/updated_at if DB handles them
  delete newItemPayload.createdAt;
  delete newItemPayload.updatedAt;
  
  Object.keys(newItemPayload).forEach(key => {
    const tsKey = key as keyof typeof newItemPayload;
    if (newItemPayload[tsKey] === undefined) {
      delete newItemPayload[tsKey];
    }
  });
  
  const { data: insertedItem, error } = await supabase
    .from('items')
    .insert([newItemPayload])
    .select()
    .single();

  if (error) {
    console.error("Error adding item:", error);
    return { error: error.message };
  }

  if (insertedItem) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return insertedItem as Item;
  }
  return { error: "Failed to add item for an unknown reason." };
}

export async function updateItem(id: string, itemData: Partial<ItemInput>): Promise<Item | { error: string } | undefined> {
    const customUserModule = await import('@/lib/actions/userActions');
    const customCurrentUser = await customUserModule.getCurrentUser();
    if (!customCurrentUser) {
      return { error: "User not authenticated." };
    }

    const currentItemData = await getItemById(id);
    if (!currentItemData || ('error' in currentItemData)) {
        return { error: "Item not found or not accessible for update." };
    }
     // Add a check to ensure the item belongs to the current user (if RLS isn't solely relied upon)
    if (currentItemData.user_id !== customCurrentUser.id) {
        return { error: "Permission denied: You can only update your own items." };
    }

    const updatePayload: { [key: string]: any } = { ...itemData };
    const now = new Date().toISOString();

    // Map camelCase to snake_case for specific fields if necessary for Supabase update
    if (itemData.originalPrice !== undefined) updatePayload.original_price = itemData.originalPrice; else if (itemData.hasOwnProperty('originalPrice')) updatePayload.original_price = null;
    if (itemData.salesPrice !== undefined) updatePayload.sales_price = itemData.salesPrice; else if (itemData.hasOwnProperty('salesPrice')) updatePayload.sales_price = null;
    if (itemData.msrp !== undefined) updatePayload.msrp = itemData.msrp; else if (itemData.hasOwnProperty('msrp')) updatePayload.msrp = null;
    if (itemData.receiptImageUrl !== undefined) updatePayload.receipt_image_url = itemData.receiptImageUrl; else if (itemData.hasOwnProperty('receiptImageUrl')) updatePayload.receipt_image_url = null;
    if (itemData.productImageUrl !== undefined) updatePayload.product_image_url = itemData.productImageUrl; else if (itemData.hasOwnProperty('productImageUrl')) updatePayload.product_image_url = null;
    if (itemData.productUrl !== undefined) updatePayload.product_url = itemData.productUrl; else if (itemData.hasOwnProperty('productUrl')) updatePayload.product_url = null;
    if (itemData.purchaseDate !== undefined) updatePayload.purchase_date = itemData.purchaseDate; else if (itemData.hasOwnProperty('purchaseDate')) updatePayload.purchase_date = null;
    if (itemData.storageLocation !== undefined) updatePayload.storage_location = itemData.storageLocation; else if (itemData.hasOwnProperty('storageLocation')) updatePayload.storage_location = null;
    if (itemData.binLocation !== undefined) updatePayload.bin_location = itemData.binLocation; else if (itemData.hasOwnProperty('binLocation')) updatePayload.bin_location = null;

    if (itemData.status && itemData.status !== currentItemData.status) {
        updatePayload.status = itemData.status;
        updatePayload.sold_date = itemData.status === 'sold' ? (itemData.soldDate || now) : null;
        updatePayload.in_use_date = itemData.status === 'in use' ? (itemData.inUseDate || now) : null;
        if (itemData.status === 'in stock') {
            updatePayload.sold_date = null;
            updatePayload.in_use_date = null;
        }
    } else if (itemData.status === currentItemData.status) { 
        if (itemData.status === 'sold') updatePayload.sold_date = itemData.soldDate !== undefined ? itemData.soldDate : currentItemData.sold_date; else if (itemData.hasOwnProperty('soldDate')) updatePayload.sold_date = null;
        if (itemData.status === 'in use') updatePayload.in_use_date = itemData.inUseDate !== undefined ? itemData.inUseDate : currentItemData.in_use_date; else if (itemData.hasOwnProperty('inUseDate')) updatePayload.in_use_date = null;
    } else { // Status not in itemData, but dates might be
        if (itemData.hasOwnProperty('soldDate')) updatePayload.sold_date = itemData.soldDate;
        if (itemData.hasOwnProperty('inUseDate')) updatePayload.in_use_date = itemData.inUseDate;
    }
    
    const keysToRemoveFromPayload = ['originalPrice', 'salesPrice', 'receiptImageUrl', 'productImageUrl', 'productUrl', 'purchaseDate', 'storageLocation', 'binLocation'];
    keysToRemoveFromPayload.forEach(key => {
      if (key in updatePayload) { // check if original camelCase key exists
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        if (snakeKey in updatePayload) { // if snake_case version also exists (meaning it was mapped)
          delete updatePayload[key]; // remove the camelCase one
        }
      }
    });

    Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined && !itemData.hasOwnProperty(key as keyof ItemInput)) { // only delete if not explicitly set to undefined
          delete updatePayload[key];
        }
    });
    
    // Explicitly exclude user_id from being updated
    delete updatePayload.user_id;
    delete updatePayload.id; // also ensure id is not part of update payload
    delete updatePayload.created_at; // ensure created_at is not updated
    updatePayload.updated_at = now; // Manually set updated_at if DB trigger isn't used/reliable for all cases


    const { data: updatedItem, error } = await supabase
        .from('items')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', customCurrentUser.id) // Ensure user owns the item
        .select()
        .single();

    if (error) {
        console.error("Error updating item:", error);
        return { error: error.message };
    }
    if (updatedItem) {
        revalidatePath("/inventory", "layout");
        revalidatePath(`/inventory/${id}`, "layout");
        revalidatePath(`/inventory/${id}/edit`, "layout");
        revalidatePath("/dashboard", "layout");
        revalidatePath("/analytics", "layout");
        return updatedItem as Item;
    }
    return { error: "Failed to update item or item not found for user."};
}

export async function deleteItem(id: string): Promise<boolean | { error: string }> {
  const customUserModule = await import('@/lib/actions/userActions');
  const customCurrentUser = await customUserModule.getCurrentUser();
  if (!customCurrentUser) {
    return { error: "User not authenticated." };
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
    .eq('user_id', customCurrentUser.id); // Ensure user owns the item

  if (error) {
    console.error("Error deleting item:", error);
    return { error: error.message };
  }
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
    console.error("Error processing receipt:", error);
    return { error: "Failed to extract data from receipt. Please try again or enter manually." };
  }
}

export async function updateItemStatus(id: string, newStatus: ItemStatus): Promise<Item | { error: string } | undefined> {
    const customUserModule = await import('@/lib/actions/userActions');
    const customCurrentUser = await customUserModule.getCurrentUser();
    if (!customCurrentUser) {
        return { error: "User not authenticated." };
    }
    
    const currentItemResult = await getItemById(id); // getItemById doesn't inherently filter by user_id with custom auth unless modified to do so
    if (!currentItemResult || 'error' in currentItemResult) {
      return { error: "Item not found." };
    }
    // Explicit check for ownership if getItemById doesn't guarantee it
    if (currentItemResult.user_id !== customCurrentUser.id) {
      return { error: "Permission denied to update status for this item." };
    }
    const currentItem = currentItemResult;
  
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
      .eq('user_id', customCurrentUser.id) // Ensure ownership for the update
      .select()
      .single();
    
    if (error) {
      console.error("Error updating item status:", error);
      return { error: error.message };
    }
  
    if (updatedItem) {
      revalidatePath("/inventory", "layout");
      revalidatePath(`/inventory/${id}`, "layout");
      revalidatePath("/dashboard", "layout");
      revalidatePath("/analytics", "layout");
      return updatedItem as Item;
    }
    return { error: "Failed to update item status or item not found for user." };
}

export async function bulkDeleteItems(itemIds: string[]): Promise<{ success: boolean; message?: string }> {
  const customUserModule = await import('@/lib/actions/userActions');
  const customCurrentUser = await customUserModule.getCurrentUser();
  if (!customCurrentUser) {
    return { success: false, message: "User not authenticated." };
  }
  if (itemIds.length === 0) return { success: false, message: "No items selected."};

  const { error, count } = await supabase
    .from('items')
    .delete({ count: 'exact' })
    .in('id', itemIds)
    .eq('user_id', customCurrentUser.id); // Ensure user owns all items being deleted

  if (error) {
    console.error("Error bulk deleting items:", error);
    return { success: false, message: error.message };
  }
  if (count && count > 0) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return { success: true, message: `${count} item(s) deleted successfully.` };
  }
  return { success: false, message: itemIds.length > 0 ? `No items deleted. Ensure you own the selected items.` : "No items selected." };
}

export async function bulkUpdateItemStatus(itemIds: string[], newStatus: ItemStatus): Promise<{ success: boolean; message?: string }> {
  const customUserModule = await import('@/lib/actions/userActions');
  const customCurrentUser = await customUserModule.getCurrentUser();
  if (!customCurrentUser) {
    return { success: false, message: "User not authenticated." };
  }
  if (itemIds.length === 0) return { success: false, message: "No items selected."};

  const updatePayload: { [key: string]: any } = { status: newStatus };
  const now = new Date().toISOString();

  if (newStatus === 'sold') {
    updatePayload.sold_date = now; // For bulk, generally set to now unless more complex logic is needed
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
    .eq('user_id', customCurrentUser.id) // Ensure user owns all items being updated
    .select({count: 'exact'}); 

  if (error) {
    console.error("Error bulk updating item status:", error);
    return { success: false, message: error.message };
  }

  if (count && count > 0) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    itemIds.forEach(id => revalidatePath(`/inventory/${id}`, "layout"));
    return { success: true, message: `${count} item(s) status updated to ${newStatus}.` };
  }
  return { success: false, message: itemIds.length > 0 ? "No items updated. Ensure you own the selected items." : "No items selected." };
}

export async function getUniqueCategories(): Promise<string[]> {
  const customUserModule = await import('@/lib/actions/userActions');
  const customCurrentUser = await customUserModule.getCurrentUser();
  if (!customCurrentUser) {
    console.warn("getUniqueCategories: No custom user found. Returning empty categories.");
    return [];
  }

  const { data, error } = await supabase
    .from('items')
    .select('category')
    .eq('user_id', customCurrentUser.id); // Filter by current user

  if (error) {
    console.error("Error fetching unique categories:", error);
    return [];
  }
  if (!data) return [];

  const categories = Array.from(new Set(data.map(item => item.category).filter(Boolean as (value: any) => value is string))).sort();
  return categories;
}


// --- Managed Options Getters/Adders/Deleters for 'managed_options' table ---

const defaultManagedCategories = ['Electronics', 'Accessories', 'Office Supplies', 'Furniture', 'Appliances', 'Software', 'Miscellaneous', 'Lighting'];
const defaultManagedSubcategories = ['Peripherals', 'Computer Accessories', 'Cables', 'Lighting', 'Kitchen Appliances', 'Productivity Tools', 'Decor', 'Desks', 'Desk Lamps'];
const defaultManagedStorageLocations = ['Warehouse A', 'Warehouse B', 'Office Shelf', 'Storage Closet', 'Remote Site', 'Main Stockroom', 'Showroom', 'Kitchen Area', 'Drawer C', 'Pantry', 'Drawer B'];
const defaultManagedBinLocations = ['A-01', 'A-02', 'A-03', 'B-01', 'C-01', 'Shelf A1', 'Shelf A2', 'Shelf 1-A', 'Shelf 1-B', 'Shelf 1-C', 'Shelf 2-A', 'Drawer X', 'Pallet 5', 'Section 1', 'Section 2', 'Bin 1', 'Bin 3', 'Display A', 'Counter Top'];
const defaultManagedRooms = ['Main Office', 'Tech Closet', 'Server Room', 'Conference Room A', 'Break Room', 'Storage Unit 1'];
const defaultManagedVendors = ['TechSupply Co.', 'Keychron', 'Accessory King', 'StandUp Inc.', 'Lights R Us', 'Office Essentials', 'Generic Supplier'];
const defaultManagedProjects = ['Office Upgrade', 'Gaming Setup', 'General Stock', 'Ergonomics Improvement', 'New Office Setup', 'Client Project X', 'Internal R&D'];


type OptionType = 'category' | 'subcategory' | 'storage_location' | 'bin_location' | 'room' | 'vendor' | 'project';

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
  const customUserModule = await import('@/lib/actions/userActions');
  const customCurrentUser = await customUserModule.getCurrentUser();
  if (!customCurrentUser) {
    console.warn(`getManagedOptions (${optionType}): No custom user found. Returning empty options.`);
    return [];
  }

  // Seed options if none exist for this user and type
  await seedUserOptions(customCurrentUser.id, optionType, optionTypeToDefaultsMap[optionType]);

  const { data, error } = await supabase
    .from('managed_options')
    .select('name')
    .eq('user_id', customCurrentUser.id)
    .eq('type', optionType)
    .order('name', { ascending: true });

  if (error) {
    console.error(`Error fetching managed options for type ${optionType}:`, error);
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
  const customUserModule = await import('@/lib/actions/userActions');
  const customCurrentUser = await customUserModule.getCurrentUser();
  if (!customCurrentUser) {
    return { success: false, message: "User not authenticated." };
  }
  const singularName = optionTypeToSingularName[optionType];

  if (!name || name.trim() === "") {
    return { success: false, message: `${singularName} name cannot be empty.` };
  }

  const { data: existing, error: selectError } = await supabase
    .from('managed_options')
    .select('id')
    .eq('user_id', customCurrentUser.id)
    .eq('type', optionType)
    .ilike('name', name.trim()) // Case-insensitive check
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but 0 rows were found" (which is fine)
      console.error(`Error checking existing ${singularName}:`, selectError);
      return { success: false, message: `Error checking existing ${singularName}: ${selectError.message}` };
  }
  if (existing) {
    return { success: false, message: `${singularName} "${name.trim()}" already exists.` };
  }

  const { error: insertError } = await supabase
    .from('managed_options')
    .insert({
      name: name.trim(),
      type: optionType,
      user_id: customCurrentUser.id,
    });

  if (insertError) {
    console.error(`Error adding ${singularName}:`, insertError);
    return { success: false, message: `Failed to add ${singularName}: ${insertError.message}` };
  }

  const updatedOptions = await getManagedOptions(optionType);
  const settingsPagePath = `/settings/${optionType.replace(/_/g, '-') + 's'}`; // e.g. /settings/storage-locations
  revalidatePath(settingsPagePath, "page");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return { success: true, message: `${singularName} "${name.trim()}" added.`, options: updatedOptions };
}

async function deleteManagedOption(name: string, optionType: OptionType): Promise<{ success: boolean; message?: string; options?: string[] }> {
  const customUserModule = await import('@/lib/actions/userActions');
  const customCurrentUser = await customUserModule.getCurrentUser();
  if (!customCurrentUser) {
    return { success: false, message: "User not authenticated." };
  }
  const singularName = optionTypeToSingularName[optionType];

  const { error } = await supabase
    .from('managed_options')
    .delete()
    .eq('user_id', customCurrentUser.id)
    .eq('type', optionType)
    .eq('name', name); // Name comparison should be exact for deletion

  if (error) {
    console.error(`Error deleting ${singularName}:`, error);
    return { success: false, message: `Failed to delete ${singularName}: ${error.message}` };
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

// --- Bulk Import ---
export interface BulkImportResult {
  successCount: number;
  errorCount: number;
  errors: { rowNumber: number; message: string; rowData: string }[];
}

export async function bulkImportItems(csvFileContent: string): Promise<BulkImportResult> {
  // This feature is temporarily disabled until it's migrated to use Supabase.
  console.warn("Bulk import feature is temporarily disabled and needs migration to Supabase.");
  const lineCount = csvFileContent.split(/\r\n|\n/).filter(line => line.trim() !== '').length;
  const errorCount = lineCount > 1 ? lineCount -1 : (lineCount === 1 ? 1: 0);

  return {
    successCount: 0,
    errorCount: errorCount,
    errors: [{ 
        rowNumber: 0, 
        message: "Bulk import is temporarily unavailable pending full migration to the new database system. Please add items individually.", 
        rowData: "" 
    }]
  };
}

    