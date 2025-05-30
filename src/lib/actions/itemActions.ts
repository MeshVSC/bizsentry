
"use server";

import type { Item, ItemInput, ItemStatus } from "@/types/item";
import { revalidatePath } from "next/cache";
import { receiptDataExtraction, type ReceiptDataExtractionInput, type ReceiptDataExtractionOutput } from '@/ai/flows/receipt-data-extraction';
import { supabase } from '@/lib/supabase/client'; // Import Supabase client

// Managed options are still in-memory for this phase
const defaultManagedCategories = ['Electronics', 'Accessories', 'Office Supplies', 'Furniture', 'Appliances', 'Software', 'Miscellaneous', 'Lighting'];
const defaultManagedSubcategories = ['Peripherals', 'Computer Accessories', 'Cables', 'Lighting', 'Kitchen Appliances', 'Productivity Tools', 'Decor', 'Desks', 'Desk Lamps'];
const defaultManagedStorageLocations = ['Warehouse A', 'Warehouse B', 'Office Shelf', 'Storage Closet', 'Remote Site', 'Main Stockroom', 'Showroom', 'Kitchen Area', 'Drawer C', 'Pantry', 'Drawer B'];
const defaultManagedBinLocations = ['A-01', 'A-02', 'A-03', 'B-01', 'C-01', 'Shelf A1', 'Shelf A2', 'Shelf 1-A', 'Shelf 1-B', 'Shelf 1-C', 'Shelf 2-A', 'Drawer X', 'Pallet 5', 'Section 1', 'Section 2', 'Bin 1', 'Bin 3', 'Display A', 'Counter Top'];
const defaultManagedRooms = ['Main Office', 'Tech Closet', 'Server Room', 'Conference Room A', 'Break Room', 'Storage Unit 1'];
const defaultManagedVendors = ['TechSupply Co.', 'Keychron', 'Accessory King', 'StandUp Inc.', 'Lights R Us', 'Office Essentials', 'Generic Supplier'];
const defaultManagedProjects = ['Office Upgrade', 'Gaming Setup', 'General Stock', 'Ergonomics Improvement', 'New Office Setup', 'Client Project X', 'Internal R&D'];

// Initialize global stores for managed options if they don't exist
if (typeof globalThis._managedCategoriesStore === 'undefined') {
  globalThis._managedCategoriesStore = [...defaultManagedCategories];
}
if (typeof globalThis._managedSubcategoriesStore === 'undefined') {
  globalThis._managedSubcategoriesStore = [...defaultManagedSubcategories];
}
if (typeof globalThis._managedStorageLocationsStore === 'undefined') {
  globalThis._managedStorageLocationsStore = [...defaultManagedStorageLocations];
}
if (typeof globalThis._managedBinLocationsStore === 'undefined') {
  globalThis._managedBinLocationsStore = [...defaultManagedBinLocations];
}
if (typeof globalThis._managedRoomsStore === 'undefined') {
  globalThis._managedRoomsStore = [...defaultManagedRooms];
}
if (typeof globalThis._managedVendorsStore === 'undefined') {
  globalThis._managedVendorsStore = [...defaultManagedVendors];
}
if (typeof globalThis._managedProjectsStore === 'undefined') {
  globalThis._managedProjectsStore = [...defaultManagedProjects];
}


export interface ItemFilters {
  name?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function getItems(filters?: ItemFilters): Promise<{ items: Item[]; totalPages: number; count: number }> {
  // RLS will handle filtering by user_id
  let query = supabase
    .from('items')
    .select('*', { count: 'exact' });

  if (filters) {
    if (filters.name && filters.name.trim() !== '') {
      query = query.ilike('name', `%${filters.name.trim()}%`);
    }
    if (filters.category && filters.category.trim() !== '') {
      query = query.eq('category', filters.category.trim());
    }
  }

  query = query.order('created_at', { ascending: false });

  // Perform an initial query to get the total count matching filters
  // This is a bit inefficient as it queries twice, but simpler for now.
  // A more optimized way would be to construct a count query separately.
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
    // No items match filters, return empty
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
    .single(); // RLS will ensure user can only fetch their own item if policies are set

  if (error) {
    console.error("Error fetching item by ID:", error);
    return undefined;
  }
  return data as Item | undefined;
}

export async function addItem(itemData: ItemInput): Promise<Item | { error: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User not authenticated" };
  }

  const now = new Date().toISOString();
  const newItemPayload = {
    ...itemData, // Assumes itemData keys are already camelCase
    // Map to snake_case for Supabase columns
    user_id: user.id,
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
    // Default barcode/QR data if SKU is not provided
    barcode_data: itemData.sku ? `BARCODE-${itemData.sku.substring(0,8).toUpperCase()}` : `BARCODE-${crypto.randomUUID().substring(0,8).toUpperCase()}`,
    qr_code_data: itemData.sku ? `QR-${itemData.sku.toUpperCase()}` : `QR-${crypto.randomUUID().toUpperCase()}`,
  };

  // Remove undefined optional fields from the payload that Supabase might reject
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
   const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "User not authenticated." };
    }

    const currentItemData = await getItemById(id);
    if (!currentItemData || ('error' in currentItemData)) {
        return { error: "Item not found or not accessible for update." };
    }

    const updatePayload: { [key: string]: any } = { ...itemData };
    const now = new Date().toISOString();

    // Map camelCase to snake_case for specific fields if necessary for Supabase update
    if (itemData.originalPrice !== undefined) updatePayload.original_price = itemData.originalPrice;
    if (itemData.salesPrice !== undefined) updatePayload.sales_price = itemData.salesPrice;
    if (itemData.receiptImageUrl !== undefined) updatePayload.receipt_image_url = itemData.receiptImageUrl;
    if (itemData.productImageUrl !== undefined) updatePayload.product_image_url = itemData.productImageUrl;
    if (itemData.productUrl !== undefined) updatePayload.product_url = itemData.productUrl;
    if (itemData.purchaseDate !== undefined) updatePayload.purchase_date = itemData.purchaseDate;
    if (itemData.storageLocation !== undefined) updatePayload.storage_location = itemData.storageLocation;
    if (itemData.binLocation !== undefined) updatePayload.bin_location = itemData.binLocation;


    if (itemData.status && itemData.status !== currentItemData.status) {
        updatePayload.status = itemData.status;
        updatePayload.sold_date = itemData.status === 'sold' ? (itemData.soldDate || now) : null;
        updatePayload.in_use_date = itemData.status === 'in use' ? (itemData.inUseDate || now) : null;
        if (itemData.status === 'in stock') {
            updatePayload.sold_date = null;
            updatePayload.in_use_date = null;
        }
    } else if (itemData.status === currentItemData.status) { // status unchanged but dates might be
        if (itemData.status === 'sold' && itemData.soldDate !== undefined) updatePayload.sold_date = itemData.soldDate;
        if (itemData.status === 'in use' && itemData.inUseDate !== undefined) updatePayload.in_use_date = itemData.inUseDate;
    }
    
    // Remove original camelCase keys if they were mapped to snake_case and itemData included them
    const keysToRemove = ['originalPrice', 'salesPrice', 'receiptImageUrl', 'productImageUrl', 'productUrl', 'purchaseDate', 'storageLocation', 'binLocation'];
    keysToRemove.forEach(key => {
        if (key in updatePayload && `${key.replace(/([A-Z])/g, "_$1").toLowerCase()}` in updatePayload) {
            delete updatePayload[key];
        }
    });

    Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined) {
          delete updatePayload[key];
        }
    });
    
    const { data: updatedItem, error } = await supabase
        .from('items')
        .update(updatePayload)
        .eq('id', id)
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
    return undefined;
}

export async function deleteItem(id: string): Promise<boolean | { error: string }> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id); // RLS handles user-specific deletion

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
    const currentItemResult = await getItemById(id);
    if (!currentItemResult || 'error' in currentItemResult) {
      return { error: "Item not found or access denied for status update." };
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
  
    const { data: updatedItem, error } = await supabase
      .from('items')
      .update(updatePayload)
      .eq('id', id)
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
    return undefined;
}

export async function bulkDeleteItems(itemIds: string[]): Promise<{ success: boolean; message?: string }> {
  if (itemIds.length === 0) return { success: false, message: "No items selected."};

  const { error, count } = await supabase
    .from('items')
    .delete({ count: 'exact' })
    .in('id', itemIds); // RLS should ensure users can only delete their own items

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
  return { success: false, message: itemIds.length > 0 ? "No matching items found or deleted." : "No items selected." };
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
  
  const { error, count } = await supabase
    .from('items')
    .update(updatePayload)
    .in('id', itemIds)
    .select({count: 'exact'}); // RLS should ensure users can only update their own items

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
  return { success: false, message: itemIds.length > 0 ? "No items updated. They may already have target status or were not found." : "No items selected." };
}

export async function getUniqueCategories(): Promise<string[]> {
  // RLS should apply here if user_id is part of the items table and policies are set
  const { data, error } = await supabase
    .from('items')
    .select('category');

  if (error) {
    console.error("Error fetching unique categories:", error);
    return [];
  }
  if (!data) return [];

  const categories = Array.from(new Set(data.map(item => item.category).filter(Boolean as (value: any) => value is string))).sort();
  return categories;
}

// --- Managed Options Getters (Still from globalThis for now) ---
type ManagedOptionStoreKey =
  | '_managedCategoriesStore'
  | '_managedSubcategoriesStore'
  | '_managedStorageLocationsStore'
  | '_managedBinLocationsStore'
  | '_managedRoomsStore'
  | '_managedVendorsStore'
  | '_managedProjectsStore';

async function getManagedOptions(storeKey: ManagedOptionStoreKey): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async
  const store = globalThis[storeKey] || [];
  return [...store].sort();
}

export async function getManagedCategoryOptions(): Promise<string[]> { return getManagedOptions('_managedCategoriesStore'); }
export async function getManagedSubcategoryOptions(): Promise<string[]> { return getManagedOptions('_managedSubcategoriesStore'); }
export async function getManagedStorageLocationOptions(): Promise<string[]> { return getManagedOptions('_managedStorageLocationsStore'); }
export async function getManagedBinLocationOptions(): Promise<string[]> { return getManagedOptions('_managedBinLocationsStore'); }
export async function getManagedRoomOptions(): Promise<string[]> { return getManagedOptions('_managedRoomsStore'); }
export async function getManagedVendorOptions(): Promise<string[]> { return getManagedOptions('_managedVendorsStore'); }
export async function getManagedProjectOptions(): Promise<string[]> { return getManagedOptions('_managedProjectsStore'); }

// --- Managed Options Adders/Deleters (Still to globalThis for now) ---
async function addManagedOption(
  name: string,
  optionType: string,
  storeKey: ManagedOptionStoreKey
): Promise<{ success: boolean; message?: string; options?: string[] }> {
  if (!name || name.trim() === "") {
    return { success: false, message: `${optionType} name cannot be empty.` };
  }
  const store: string[] = globalThis[storeKey] || [];
  if (store.map(s => s.toLowerCase()).includes(name.toLowerCase())) {
    return { success: false, message: `${optionType} "${name}" already exists.` };
  }
  store.push(name);
  globalThis[storeKey] = store;
  
  const settingsPagePath = `/settings/${optionType.toLowerCase().replace(/\s+/g, '-') + 's'}`;
  revalidatePath(settingsPagePath, "page");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return { success: true, message: `${optionType} "${name}" added.`, options: [...store].sort() };
}

async function deleteManagedOption(
  name: string,
  optionType: string,
  storeKey: ManagedOptionStoreKey
): Promise<{ success: boolean; message?: string; options?: string[] }> {
  const store: string[] = globalThis[storeKey] || [];
  const initialLength = store.length;
  globalThis[storeKey] = store.filter((opt: string) => opt !== name);
  if (globalThis[storeKey].length < initialLength) {
    const settingsPagePath = `/settings/${optionType.toLowerCase().replace(/\s+/g, '-') + 's'}`;
    revalidatePath(settingsPagePath, "page");
    revalidatePath("/inventory/add", "layout");
    revalidatePath("/inventory/[id]/edit", "layout");
    return { success: true, message: `${optionType} "${name}" deleted.`, options: [...globalThis[storeKey]].sort() };
  }
  return { success: false, message: `${optionType} "${name}" not found.` };
}

export async function addManagedCategoryOption(name: string) { return addManagedOption(name, "Category", '_managedCategoriesStore'); }
export async function deleteManagedCategoryOption(name: string) { return deleteManagedOption(name, "Category", '_managedCategoriesStore'); }
export async function addManagedSubcategoryOption(name: string) { return addManagedOption(name, "Subcategory", '_managedSubcategoriesStore'); }
export async function deleteManagedSubcategoryOption(name: string) { return deleteManagedOption(name, "Subcategory", '_managedSubcategoriesStore'); }
export async function addManagedStorageLocationOption(name: string) { return addManagedOption(name, "Storage Location", '_managedStorageLocationsStore'); }
export async function deleteManagedStorageLocationOption(name: string) { return deleteManagedOption(name, "Storage Location", '_managedStorageLocationsStore'); }
export async function addManagedBinLocationOption(name: string) { return addManagedOption(name, "Bin Location", '_managedBinLocationsStore'); }
export async function deleteManagedBinLocationOption(name: string) { return deleteManagedOption(name, "Bin Location", '_managedBinLocationsStore'); }
export async function addManagedRoomOption(name: string) { return addManagedOption(name, "Room", '_managedRoomsStore'); }
export async function deleteManagedRoomOption(name: string) { return deleteManagedOption(name, "Room", '_managedRoomsStore'); }
export async function addManagedVendorOption(name: string) { return addManagedOption(name, "Vendor", '_managedVendorsStore'); }
export async function deleteManagedVendorOption(name: string) { return deleteManagedOption(name, "Vendor", '_managedVendorsStore'); }
export async function addManagedProjectOption(name: string) { return addManagedOption(name, "Project", '_managedProjectsStore'); }
export async function deleteManagedProjectOption(name: string) { return deleteManagedOption(name, "Project", '_managedProjectsStore'); }

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
        message: "Bulk import is temporarily unavailable pending migration to the new database system. Please add items individually.", 
        rowData: "" 
    }]
  };
}
