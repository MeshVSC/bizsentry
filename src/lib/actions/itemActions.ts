
"use server";

import type { Item, ItemInput, ExtractedItemData, ItemStatus } from "@/types/item";
import { revalidatePath } from "next/cache";
import { receiptDataExtraction, type ReceiptDataExtractionInput, type ReceiptDataExtractionOutput } from '@/ai/flows/receipt-data-extraction';
import { supabase } from '@/lib/supabase/client'; // For server-side client

// Managed options are still in-memory for this phase
const defaultManagedCategories = ['Electronics', 'Accessories', 'Office Supplies', 'Furniture', 'Appliances', 'Software', 'Miscellaneous', 'Lighting'];
const defaultManagedSubcategories = ['Peripherals', 'Computer Accessories', 'Cables', 'Lighting', 'Kitchen Appliances', 'Productivity Tools', 'Decor', 'Desks', 'Desk Lamps'];
const defaultManagedStorageLocations = ['Warehouse A', 'Warehouse B', 'Office Shelf', 'Storage Closet', 'Remote Site', 'Main Stockroom', 'Showroom', 'Kitchen Area', 'Drawer C', 'Pantry', 'Drawer B'];
const defaultManagedBinLocations = ['A-01', 'A-02', 'A-03', 'B-01', 'C-01', 'Shelf A1', 'Shelf A2', 'Shelf 1-A', 'Shelf 1-B', 'Shelf 1-C', 'Shelf 2-A', 'Drawer X', 'Pallet 5', 'Section 1', 'Section 2', 'Bin 1', 'Bin 3', 'Display A', 'Counter Top'];
const defaultManagedRooms = ['Main Office', 'Tech Closet', 'Server Room', 'Conference Room A', 'Break Room', 'Storage Unit 1'];
const defaultManagedVendors = ['TechSupply Co.', 'Keychron', 'Accessory King', 'StandUp Inc.', 'Lights R Us', 'Office Essentials', 'Generic Supplier'];
const defaultManagedProjects = ['Office Upgrade', 'Gaming Setup', 'General Stock', 'Ergonomics Improvement', 'New Office Setup', 'Client Project X', 'Internal R&D'];

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
  const { data: { user } } = await supabase.auth.getUser(); // Get current Supabase user
  // if (!user) { // This check should ideally be handled by route protection
  //   return { items: [], totalPages: 0, count: 0 };
  // }

  let query = supabase
    .from('items')
    .select('*', { count: 'exact' });
    // .eq('user_id', user.id); // RLS should handle this, but explicit can be good for clarity

  if (filters) {
    if (filters.name && filters.name.trim() !== '') {
      query = query.ilike('name', `%${filters.name.trim()}%`);
    }
    if (filters.category && filters.category.trim() !== '') {
      // Assuming category is stored as category_name for now
      query = query.eq('category', filters.category.trim());
    }
  }

  query = query.order('created_at', { ascending: false });

  const { data: countData, error: countError, count } = await query; // Execute once to get total count

  if (countError) {
    console.error("Error fetching item count:", countError);
    return { items: [], totalPages: 0, count: 0 };
  }

  const totalItems = count || 0;
  let totalPages = 1;

  if (filters?.page && filters?.limit) {
    const page = filters.page;
    const limit = filters.limit;
    const startIndex = (page - 1) * limit;
    totalPages = Math.ceil(totalItems / limit);
    query = query.range(startIndex, startIndex + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching items:", error);
    return { items: [], totalPages: 0, count: 0 };
  }

  return { items: (data as Item[]) || [], totalPages, count: totalItems };
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return undefined; // RLS should handle this

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    // .eq('user_id', user.id) // RLS should handle this
    .single();

  if (error) {
    console.error("Error fetching item by ID:", error);
    return undefined;
  }
  return data as Item | undefined;
}

export async function addItem(data: ItemInput): Promise<Item | { error: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User not authenticated" };
  }

  const newItemPayload = {
    ...data,
    user_id: user.id, // Associate item with the current user
    // Ensure numeric fields are numbers or null, not empty strings
    original_price: data.originalPrice === undefined || data.originalPrice === null ? null : Number(data.originalPrice),
    sales_price: data.salesPrice === undefined || data.salesPrice === null ? null : Number(data.salesPrice),
    msrp: data.msrp === undefined || data.msrp === null ? null : Number(data.msrp),
    barcode_data: data.sku ? `BARCODE-${data.sku.substring(0,8).toUpperCase()}` : `BARCODE-${crypto.randomUUID().substring(0,8).toUpperCase()}`, // Simplified barcode/QR generation
    qr_code_data: data.sku ? `QR-${data.sku.toUpperCase()}` : `QR-${crypto.randomUUID().toUpperCase()}`,
  };
  // Remove undefined optional fields before insert, or Supabase might error
  Object.keys(newItemPayload).forEach(key => {
    if (newItemPayload[key as keyof typeof newItemPayload] === undefined) {
      delete newItemPayload[key as keyof typeof newItemPayload];
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
    revalidatePath("/inventory/add", "layout");
    return insertedItem as Item;
  }
  return { error: "Failed to add item for an unknown reason." };
}

export async function updateItem(id: string, data: Partial<ItemInput>): Promise<Item | { error: string } | undefined> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User not authenticated" };
  }
  
  const currentItem = await getItemById(id);
  if (!currentItem || ('error' in currentItem)) return { error: "Item not found or not accessible." };

  const updatePayload: Partial<Item> = { ...data };
   // Ensure numeric fields are numbers or null
  if (data.originalPrice !== undefined) updatePayload.originalPrice = data.originalPrice === null ? null : Number(data.originalPrice);
  if (data.salesPrice !== undefined) updatePayload.salesPrice = data.salesPrice === null ? null : Number(data.salesPrice);
  if (data.msrp !== undefined) updatePayload.msrp = data.msrp === null ? null : Number(data.msrp);


  if (data.status && data.status !== currentItem.status) {
    const now = new Date().toISOString();
    updatePayload.sold_date = data.status === 'sold' ? (data.soldDate || now) : null;
    updatePayload.in_use_date = data.status === 'in use' ? (data.inUseDate || now) : null;
    if (data.status === 'in stock') {
        updatePayload.sold_date = null;
        updatePayload.in_use_date = null;
    }
  }
  // Remove undefined optional fields
   Object.keys(updatePayload).forEach(key => {
    if (updatePayload[key as keyof typeof updatePayload] === undefined) {
      delete updatePayload[key as keyof typeof updatePayload];
    }
  });


  const { data: updatedItem, error } = await supabase
    .from('items')
    .update(updatePayload)
    .eq('id', id)
    // .eq('user_id', user.id) // RLS should handle this
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
   const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User not authenticated" };
  }
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);
    // .eq('user_id', user.id); // RLS should handle this

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "User not authenticated."};

  const currentItemResult = await getItemById(id);
  if (!currentItemResult || 'error' in currentItemResult) {
    return { error: "Item not found or access denied." };
  }
  const currentItem = currentItemResult;


  const updatePayload: Partial<Item> = { status: newStatus };
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
    // .eq('user_id', user.id) // RLS
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "User not authenticated."};

  const { error, count } = await supabase
    .from('items')
    .delete({ count: 'exact' })
    .in('id', itemIds);
    // .eq('user_id', user.id); // RLS should handle this

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "User not authenticated."};

  const updatePayload: Partial<Omit<Item, 'id' | 'created_at' | 'user_id' | 'updated_at'>> = { status: newStatus };
  const now = new Date().toISOString();

  if (newStatus === 'sold') {
    updatePayload.sold_date = now; // For bulk, we assume it's a new sale date for all
    updatePayload.in_use_date = null;
  } else if (newStatus === 'in use') {
    updatePayload.in_use_date = now; // Assume new in-use date
    updatePayload.sold_date = null;
  } else { // 'in stock'
    updatePayload.sold_date = null;
    updatePayload.in_use_date = null;
  }
  
  const { data, error, count } = await supabase
    .from('items')
    .update(updatePayload)
    .in('id', itemIds)
    // .eq('user_id', user.id) // RLS
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
  return { success: false, message: itemIds.length > 0 ? "No items updated. They may already have target status or were not found." : "No items selected." };
}


export async function getUniqueCategories(): Promise<string[]> {
  // This should now fetch distinct categories from the items table in Supabase
  const { data, error } = await supabase
    .from('items')
    .select('category', { count: 'exact', head: false });

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
  // Revalidate relevant settings pages
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
// THIS FUNCTION IS NOT YET MIGRATED TO SUPABASE AND WILL NOT WORK CORRECTLY.
export interface BulkImportResult {
  successCount: number;
  errorCount: number;
  errors: { rowNumber: number; message: string; rowData: string }[];
}

export async function bulkImportItems(csvFileContent: string): Promise<BulkImportResult> {
  console.warn("bulkImportItems is not yet migrated to Supabase and will not work correctly.");
  // For now, return a dummy result indicating failure or that it's non-functional
  return {
    successCount: 0,
    errorCount: csvFileContent.split(/\r\n|\n/).filter(line => line.trim() !== '').length -1 || 0, // approximate row count
    errors: [{ rowNumber: 0, message: "Bulk import is temporarily unavailable. This feature needs to be updated to work with the new database.", rowData: "" }]
  };
}

