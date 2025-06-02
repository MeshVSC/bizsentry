
"use server";

import type { Item, ItemInput, ItemStatus } from "@/types/item";
import { revalidatePath } from "next/cache";
import { receiptDataExtraction, type ReceiptDataExtractionInput, type ReceiptDataExtractionOutput } from '@/ai/flows/receipt-data-extraction';
import { supabase } from '@/lib/supabase/client'; 
import { getCurrentUser } from '@/lib/actions/userActions'; 

async function seedUserOptions(userId: string | null, optionType: string, defaultOptions: string[]) {
  if (!userId) { // If auth is paused and no user ID, don't try to seed user-specific options.
    // console.log(`[SeedUserOptions] Auth paused for ${optionType}, skipping user-specific seeding.`);
    // Optionally, you could seed global options here if your schema supports options without a user_id.
    // For now, we just skip.
    return;
  }

  const { data: existingOptions, error: fetchError } = await supabase
    .from('managed_options')
    .select('name')
    .eq('user_id', userId)
    .eq('type', optionType);

  if (fetchError) {
    return; 
  }

  if (existingOptions && existingOptions.length === 0) {
    const optionsToInsert = defaultOptions.map(name => ({
      name,
      type: optionType,
      user_id: userId,
    }));

    const { error: insertError } = await supabase
      .from('managed_options')
      .insert(optionsToInsert);

    if (insertError) {
      // console.error(`Error seeding ${optionType} for user ${userId}:`, insertError);
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
  const authResult = await getCurrentUser();
  // When auth is paused, authResult.user will be null.
  const userId = authResult.user?.id; // Will be null if auth is paused.

  let query = supabase
    .from('items')
    .select('*', { count: 'exact' });

  // If userId is available (auth not paused), filter by user_id.
  // If userId is null (auth paused), DO NOT filter by user_id, effectively fetching all items.
  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    // console.log("[GetItems] Auth paused, fetching items without user_id filter.");
  }


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
    return { items: [], totalPages: 0, count: 0 };
  }

  return { items: (data as Item[]) || [], totalPages, count: totalItems };
}

export async function getItemById(id: string): Promise<Item | undefined | { error: string }> {
  const authResult = await getCurrentUser();
  const userId = authResult.user?.id; // Will be null if auth is paused

  let query = supabase
    .from('items')
    .select('*')
    .eq('id', id);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    // console.log(`[GetItemById] Auth paused, fetching item ${id} without user_id filter.`);
  }
  
  const { data, error } = await query.single(); 

  if (error) {
    if (error.code === 'PGRST116') { 
        return { error: "Item not found." }; // Simpler message if auth is paused
    }
    return { error: error.message };
  }
  return data as Item | undefined;
}

export async function addItem(itemData: ItemInput): Promise<Item | { error: string }> {
  const authDetails = await getCurrentUser();
  // When auth is paused, authDetails.user is null.
  // We will set user_id to null in the database if items.user_id is nullable.
  const finalUserIdForOperation = authDetails.user?.id || null; 
  
  const now = new Date().toISOString();

  const newItemPayload: Record<string, any> = {
    user_id: finalUserIdForOperation, // This will be NULL if auth is paused
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
    return { error: `Failed to add item: ${error.message}. Details: ${error.details}. Note: If auth is paused, items.user_id must be nullable in your database.` };
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
    const authDetails = await getCurrentUser();
    const userId = authDetails.user?.id; // Will be null if auth paused

    const currentItemResult = await getItemById(id); 
    if (!currentItemResult || 'error' in currentItemResult) {
        return { error: (currentItemResult as { error: string })?.error || "Item not found or not accessible for update." };
    }
    
    const currentItem = currentItemResult as Item; 

    const updatePayload: { [key: string]: any } = {};
    const now = new Date().toISOString();

    const directFields: (keyof ItemInput)[] = ['name', 'description', 'quantity', 'category', 'subcategory', 'room', 'vendor', 'project', 'msrp', 'sku'];
    directFields.forEach(field => {
        if (itemData.hasOwnProperty(field)) {
            updatePayload[field] = itemData[field] === undefined ? null : itemData[field];
        }
    });
    
    if (itemData.hasOwnProperty('originalPrice')) updatePayload.original_price = itemData.originalPrice === undefined ? null : itemData.originalPrice;
    if (itemData.hasOwnProperty('salesPrice')) updatePayload.sales_price = itemData.salesPrice === undefined ? null : itemData.salesPrice;
    if (itemData.hasOwnProperty('receiptImageUrl')) updatePayload.receipt_image_url = itemData.receiptImageUrl === undefined ? null : itemData.receiptImageUrl;
    if (itemData.hasOwnProperty('productImageUrl')) updatePayload.product_image_url = itemData.productImageUrl === undefined ? null : itemData.productImageUrl;
    if (itemData.hasOwnProperty('productUrl')) updatePayload.product_url = itemData.productUrl === undefined ? null : itemData.productUrl;
    if (itemData.hasOwnProperty('purchaseDate')) updatePayload.purchase_date = itemData.purchaseDate === undefined ? null : itemData.purchaseDate;
    if (itemData.hasOwnProperty('storageLocation')) updatePayload.storage_location = itemData.storageLocation === undefined ? null : itemData.storageLocation;
    if (itemData.hasOwnProperty('binLocation')) updatePayload.bin_location = itemData.binLocation === undefined ? null : itemData.binLocation;
    
    if (itemData.status && itemData.status !== currentItem.status) {
        updatePayload.status = itemData.status;
        updatePayload.sold_date = itemData.status === 'sold' ? (itemData.soldDate || now) : null;
        updatePayload.in_use_date = itemData.status === 'in use' ? (itemData.inUseDate || now) : null;
        if (itemData.status === 'in stock') {
            updatePayload.sold_date = null;
            updatePayload.in_use_date = null;
        }
    } else if (itemData.status === currentItem.status) { 
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

    let query = supabase
        .from('items')
        .update(updatePayload)
        .eq('id', id);

    if (userId) { // Only filter by user_id if auth is not paused
        query = query.eq('user_id', userId);
    }
    
    const { data: updatedItem, error } = await query.select().single();

    if (error) {
        return { error: `Failed to update item: ${error.message}. Details: ${error.details}` };
    }
    if (updatedItem) {
        revalidatePath("/inventory", "layout");
        revalidatePath(`/inventory/${id}`, "layout");
        revalidatePath(`/inventory/${id}/edit`, "layout");
        revalidatePath("/dashboard", "layout");
        revalidatePath("/analytics", "layout");
        return updatedItem as Item;
    }
    return { error: "Failed to update item or item not found."};
}

export async function deleteItem(id: string): Promise<boolean | { error: string }> {
  const authResult = await getCurrentUser();
  const userId = authResult.user?.id; // Will be null if auth is paused

  let query = supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (userId) {
    query = query.eq('user_id', userId); 
  }
  
  const { error } = await query;

  if (error) {
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
    return { error: "Failed to extract data from receipt. Please try again or enter manually." };
  }
}

export async function updateItemStatus(id: string, newStatus: ItemStatus): Promise<Item | { error: string } | undefined> {
    const authResult = await getCurrentUser();
    const userId = authResult.user?.id; // Will be null if auth is paused
    
    const currentItemResult = await getItemById(id); 
    if (!currentItemResult || 'error' in currentItemResult) {
      return { error: (currentItemResult as {error: string})?.error || "Item not found." };
    }
    
    const currentItem = currentItemResult as Item; 
  
    const updatePayload: { [key: string]: any } = { status: newStatus };
    const now = new Date().toISOString();
  
    if (newStatus === 'sold') {
      updatePayload.sold_date = currentItem.sold_date || now;
      updatePayload.in_use_date = null;
    } else if (newStatus === 'in use') {
      updatePayload.in_use_date = currentItem.in_use_date || now;
      updatePayload.sold_date = null;
    } else { 
      updatePayload.sold_date = null;
      updatePayload.in_use_date = null;
    }
    updatePayload.updated_at = now;
  
    let query = supabase
      .from('items')
      .update(updatePayload)
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }
      
    const { data: updatedItem, error } = await query.select().single();
    
    if (error) {
      return { error: error.message };
    }
  
    if (updatedItem) {
      revalidatePath("/inventory", "layout");
      revalidatePath(`/inventory/${id}`, "layout");
      revalidatePath("/dashboard", "layout");
      revalidatePath("/analytics", "layout");
      return updatedItem as Item;
    }
    return { error: "Failed to update item status or item not found." };
}

export async function bulkDeleteItems(itemIds: string[]): Promise<{ success: boolean; message?: string }> {
  const authResult = await getCurrentUser();
  const userId = authResult.user?.id; // Will be null if auth is paused

  if (itemIds.length === 0) return { success: false, message: "No items selected."};

  let query = supabase
    .from('items')
    .delete({ count: 'exact' })
    .in('id', itemIds);

  if (userId) {
    query = query.eq('user_id', userId); 
  }

  const { error, count } = await query;

  if (error) {
    return { success: false, message: error.message };
  }
  if (count && count > 0) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return { success: true, message: `${count} item(s) deleted successfully.` };
  }
  return { success: false, message: itemIds.length > 0 ? `No items deleted.` : "No items selected." };
}

export async function bulkUpdateItemStatus(itemIds: string[], newStatus: ItemStatus): Promise<{ success: boolean; message?: string }> {
  const authResult = await getCurrentUser();
  const userId = authResult.user?.id; // Will be null if auth is paused
  if (itemIds.length === 0) return { success: false, message: "No items selected."};

  const updatePayload: { [key: string]: any } = { status: newStatus };
  const now = new Date().toISOString();

  if (newStatus === 'sold') {
    updatePayload.sold_date = now; 
    updatePayload.in_use_date = null;
  } else if (newStatus === 'in use') {
    updatePayload.in_use_date = now;
    updatePayload.sold_date = null;
  } else { 
    updatePayload.sold_date = null;
    updatePayload.in_use_date = null;
  }
  updatePayload.updated_at = now;
  
  let query = supabase
    .from('items')
    .update(updatePayload)
    .in('id', itemIds);

  if (userId) {
    query = query.eq('user_id', userId); 
  }
  
  const { error, count } = await query.select({count: 'exact'}); 

  if (error) {
    return { success: false, message: error.message };
  }

  if (count && count > 0) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    itemIds.forEach(id => revalidatePath(`/inventory/${id}`, "layout"));
    return { success: true, message: `${count} item(s) status updated to ${newStatus}.` };
  }
  return { success: false, message: itemIds.length > 0 ? "No items updated." : "No items selected." };
}

export async function getUniqueCategories(): Promise<string[]> {
  const authResult = await getCurrentUser();
  const userId = authResult.user?.id; // Will be null if auth is paused

  let query = supabase
    .from('items')
    .select('category');

  if (userId) {
    query = query.eq('user_id', userId); 
  }

  const { data, error } = await query;

  if (error) {
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
  const authResult = await getCurrentUser();
  const userId = authResult.user?.id; // Will be null if auth paused

  // If auth is paused (userId is null), seeding user-specific options is skipped by seedUserOptions.
  // We also need to decide if managed options should be global or empty in this state.
  // For now, let's assume if auth is paused, we fetch options without a user_id filter,
  // effectively making them global, or reliant on how seedUserOptions handles null userId.
  await seedUserOptions(userId, optionType, optionTypeToDefaultsMap[optionType]);

  let query = supabase
    .from('managed_options')
    .select('name')
    .eq('type', optionType);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    // console.log(`[GetManagedOptions - ${optionType}] Auth paused. Fetching without user_id. Requires options to be global or seeded without user_id if schema allows.`);
    // If your 'managed_options' table requires user_id, this might return nothing or error.
    // For full "paused auth", schema might need user_id on managed_options to be nullable.
    // Assuming for now it might fetch options where user_id IS NULL, or just returns all if no user_id filter applied.
  }
  
  const { data, error } = await query.order('name', { ascending: true });

  if (error) {
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
  const authResult = await getCurrentUser();
  const userId = authResult.user?.id; // Will be null if auth paused
  const singularName = optionTypeToSingularName[optionType];

  if (!name || name.trim() === "") {
    return { success: false, message: `${singularName} name cannot be empty.` };
  }

  let selectQuery = supabase
    .from('managed_options')
    .select('id')
    .eq('type', optionType)
    .ilike('name', name.trim());
  
  if (userId) {
    selectQuery = selectQuery.eq('user_id', userId);
  } else {
    // If auth is paused, we might be adding a "global" option (user_id is NULL).
    // The check for existing should also consider options where user_id IS NULL.
    selectQuery = selectQuery.is('user_id', null);
  }

  const { data: existing, error: selectError } = await selectQuery.single();

  if (selectError && selectError.code !== 'PGRST116') { 
      return { success: false, message: `Error checking existing ${singularName}: ${selectError.message}` };
  }
  if (existing) {
    return { success: false, message: `${singularName} "${name.trim()}" already exists${userId ? ' for this user' : ' as a global option'}.` };
  }

  const { error: insertError } = await supabase
    .from('managed_options')
    .insert({
      name: name.trim(),
      type: optionType,
      user_id: userId, // This will be NULL if auth is paused. Requires managed_options.user_id to be nullable.
    });

  if (insertError) {
    return { success: false, message: `Failed to add ${singularName}: ${insertError.message}. (Note: If auth paused, managed_options.user_id must be nullable)` };
  }

  const updatedOptions = await getManagedOptions(optionType);
  const settingsPagePath = `/settings/${optionType.replace(/_/g, '-') + 's'}`; 
  revalidatePath(settingsPagePath, "page");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return { success: true, message: `${singularName} "${name.trim()}" added.`, options: updatedOptions };
}

async function deleteManagedOption(name: string, optionType: OptionType): Promise<{ success: boolean; message?: string; options?: string[] }> {
  const authResult = await getCurrentUser();
  const userId = authResult.user?.id; // Will be null if auth paused
  const singularName = optionTypeToSingularName[optionType];

  let deleteQuery = supabase
    .from('managed_options')
    .delete()
    .eq('type', optionType)
    .eq('name', name); 

  if (userId) {
    deleteQuery = deleteQuery.eq('user_id', userId);
  } else {
    // If auth paused, attempting to delete an option where user_id IS NULL (global option)
    deleteQuery = deleteQuery.is('user_id', null);
  }

  const { error } = await deleteQuery;

  if (error) {
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
  const authDetails = await getCurrentUser(); // Get user context for items (will be null if paused)
  const userIdForImport = authDetails.user?.id || null;


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
        // invokedByUserId is not part of CSV, addItem will use its own getCurrentUser logic
      };
      
      if (itemInput.originalPrice !== undefined && isNaN(itemInput.originalPrice)) itemInput.originalPrice = undefined;
      if (itemInput.salesPrice !== undefined && isNaN(itemInput.salesPrice)) itemInput.salesPrice = undefined;
      if (itemInput.msrp !== undefined && isNaN(itemInput.msrp)) itemInput.msrp = undefined;
      if (itemInput.purchaseDate && (itemInput.purchaseDate.includes("Invalid Date") || !purchaseDateStr)) {
        itemInput.purchaseDate = undefined;
      }

      // The addItem function will now handle setting user_id to null if auth is paused.
      const addResult = await addItem(itemInput);
      if ('error' in addResult) {
        results.errorCount++;
        results.errors.push({ rowNumber, message: addResult.error, rowData: line });
      } else {
        results.successCount++;
      }
    } catch (error: any) {
      results.errorCount++;
      results.errors.push({ rowNumber, message: error.message || "Failed to add item.", rowData: line });
    }
  }

  if (results.successCount > 0) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
  }
  return results;
}
