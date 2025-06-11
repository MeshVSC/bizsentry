
"use server";

import type { Item, ItemInput, ItemStatus } from "@/types/item";
import { revalidatePath } from "next/cache";
import { receiptDataExtraction, type ReceiptDataExtractionInput, type ReceiptDataExtractionOutput } from '@/ai/flows/receipt-data-extraction';
import { supabase } from '@/lib/supabase/client';

const ADMIN_USER_ID = '047dd250-5c94-44f2-8827-6ff6bff8207c'; // User ID for "stock_sentry_admin"

async function verifyAdminUserExists(): Promise<{ success: boolean; error?: string }> {
  // Log the exact ADMIN_USER_ID value being used in this function's environment
  console.log(`[Admin User Verification] Attempting to verify ADMIN_USER_ID: '${ADMIN_USER_ID}'`);

  const { data, error } = await supabase
    .from('stock_sentry_users')
    .select('id')
    .eq('id', ADMIN_USER_ID)
    .maybeSingle();

  if (error) {
    console.error(`[Admin User Verification Error] Supabase query failed for ADMIN_USER_ID '${ADMIN_USER_ID}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`);
    return { success: false, error: `Database error during admin user verification. Check Supabase Function logs for detailed Supabase error.` };
  }
  if (!data) {
    console.error(`[Admin User Verification Error] ADMIN_USER_ID '${ADMIN_USER_ID}' not found in stock_sentry_users table by the Supabase Function.`);
    return { success: false, error: `Configured ADMIN_USER_ID '${ADMIN_USER_ID}' not found in the users table by the Supabase Function. Please check configuration, RLS (if any on stock_sentry_users), and Supabase Function environment/permissions.` };
  }
  console.log(`[Admin User Verification Success] ADMIN_USER_ID '${ADMIN_USER_ID}' successfully verified by the Supabase Function.`);
  return { success: true };
}


async function logAuditAction(
  action_type: string,
  params: {
    target_table?: string;
    target_record_id?: string | null; 
    details?: any;
    description?: string;
  }
) {
  try {
    const { error } = await supabase.from('audit_log').insert({
      user_id: ADMIN_USER_ID,
      action_type,
      target_table: params.target_table,
      target_record_id: params.target_record_id || null, 
      details: params.details,
      description: params.description,
    });
    if (error) {
      console.error(`[Audit Log Error] Failed to log action '${action_type}'. User ID '${ADMIN_USER_ID}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}. Params:`, params);
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
        } else {
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

  const countQueryBuilder = supabase
    .from('items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ADMIN_USER_ID);

  if (filters?.name && filters.name.trim() !== '') {
    countQueryBuilder.ilike('name', `%${filters.name.trim()}%`);
  }
  if (filters?.category && filters.category.trim() !== '') {
    countQueryBuilder.eq('category', filters.category.trim());
  }

  const { count: totalMatchingCount, error: countError } = await countQueryBuilder;


  if (countError) {
    console.error(`[getItems Count Error] User ID '${ADMIN_USER_ID}'. Message: ${countError.message}. Code: ${countError.code}. Details: ${countError.details}. Hint: ${countError.hint}`);
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


  const { data, error: dataError } = await query;

  if (dataError) {
    console.error(`[getItems Data Error] User ID '${ADMIN_USER_ID}'. Message: ${dataError.message}. Code: ${dataError.code}. Details: ${dataError.details}. Hint: ${dataError.hint}`);
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
    console.error(`[getItemById Supabase Error] Item ID '${id}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`);
    return { error: "Database operation failed. Please check Supabase Function logs for specific error details. Action: getItemById (fetch)" };
  }

  if (!data) {
    return { error: `Item with ID '${id}' not found.` };
  }

  if (data.user_id !== ADMIN_USER_ID) {
    console.warn(`[getItemById Auth Warn] Item ID '${id}' found, but its user_id ('${data.user_id}') does not match the expected ADMIN_USER_ID ('${ADMIN_USER_ID}'). This item may not belong to the admin user.`);
    return { error: `Access denied for item ID '${id}' because its user_id ('${data.user_id}') does not match the expected admin user_id ('${ADMIN_USER_ID}'). Check item ownership.` };
  }

  return data as Item;
}


export async function addItem(itemData: ItemInput): Promise<Item | { error: string }> {
  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return { error: adminUserCheck.error || "Admin user verification failed before adding item. Check Supabase Function logs." };
  }

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
    barcode_data: `BARCODE-${(itemData.sku || crypto.randomUUID()).substring(0,8).toUpperCase()}`,
    qr_code_data: `QR-${(itemData.sku || crypto.randomUUID()).toUpperCase()}`,
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
    console.error(`[addItem Supabase Error] User ID '${ADMIN_USER_ID}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`);
    console.error("[addItem Supabase Error] Failing Payload:", JSON.stringify(newItemPayload, null, 2));
    return { error: "Database operation failed. Please check Supabase Function logs for specific error details. Action: addItem" };
  }

  if (insertedItem) {
    await logAuditAction('ITEM_CREATED', {
      target_table: 'items',
      target_record_id: insertedItem.id.toString(),
      details: { name: insertedItem.name, quantity: insertedItem.quantity, status: insertedItem.status },
      description: `Admin created item '${insertedItem.name}' (ID: ${insertedItem.id}).`
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return insertedItem as Item;
  }
  console.warn("[addItem Warning] No data returned for insertedItem but no explicit Supabase error.");
  return { error: "Failed to add item (no data returned after insert). Check Supabase Function logs. Action: addItem" };
}

export async function updateItem(id: string, itemData: Partial<ItemInput>): Promise<Item | { error: string } | undefined> {
    const adminUserCheck = await verifyAdminUserExists();
    if (!adminUserCheck.success) {
      return { error: adminUserCheck.error || "Admin user verification failed before updating item. Check Supabase Function logs." };
    }

    const currentItemResult = await getItemById(id);
    if (!currentItemResult || 'error' in currentItemResult) {
        const preCheckError = (currentItemResult as {error: string})?.error || "Item not found or access denied during pre-check for update.";
        console.error(`[updateItem Pre-check Error] For item ID '${id}': ${preCheckError}`);
        return { error: preCheckError };
    }
    const currentItem = currentItemResult as Item;
    
    console.log(`[updateItem Debug] For Item ID: ${id}, User ID from getItemById is: '${currentItem.user_id}'. Comparing with ADMIN_USER_ID: '${ADMIN_USER_ID}'.`);


    const updatePayload: { [key: string]: any } = {};
    const now = new Date().toISOString();
    const changes: Record<string, { old: any; new: any }> = {};

    const fieldMap: Record<keyof Omit<ItemInput, 'status' | 'soldDate' | 'inUseDate' | 'purchaseDate'>, string> = {
        name: 'name',
        description: 'description',
        quantity: 'quantity',
        category: 'category',
        subcategory: 'subcategory',
        storageLocation: 'storage_location',
        binLocation: 'bin_location',
        room: 'room',
        vendor: 'vendor',
        project: 'project',
        originalPrice: 'original_price',
        salesPrice: 'sales_price',
        msrp: 'msrp',
        sku: 'sku',
        receiptImageUrl: 'receipt_image_url',
        productImageUrl: 'product_image_url',
        productUrl: 'product_url',
    };
    
    for (const key in fieldMap) {
        if (itemData.hasOwnProperty(key as keyof typeof fieldMap)) {
            const itemInputKey = key as keyof typeof fieldMap;
            const dbColumnKey = fieldMap[itemInputKey];
            const incomingValue = itemData[itemInputKey];
            const currentValue = (currentItem as any)[dbColumnKey]; 

            if (currentValue !== incomingValue) {
                changes[itemInputKey] = { old: currentValue, new: incomingValue };
            }
            updatePayload[dbColumnKey] = (incomingValue === "" || incomingValue === undefined) ? null : incomingValue;
        }
    }

    if (itemData.hasOwnProperty('purchaseDate')) {
        const incomingDate = itemData.purchaseDate ? new Date(itemData.purchaseDate).toISOString() : null;
        const currentDate = currentItem.purchase_date ? new Date(currentItem.purchase_date).toISOString() : null;
        if (currentDate !== incomingDate) {
            changes['purchaseDate'] = { old: currentDate, new: incomingDate };
        }
        updatePayload.purchase_date = incomingDate;
    }

    const currentDbStatus = currentItem.status;
    if (itemData.hasOwnProperty('status') && itemData.status !== currentDbStatus) {
      if (currentDbStatus !== itemData.status) changes['status'] = { old: currentDbStatus, new: itemData.status };
      updatePayload.status = itemData.status!;

      const newSoldDate = itemData.status === 'sold' ? (itemData.soldDate ? new Date(itemData.soldDate).toISOString() : now) : null;
      if (currentItem.sold_date !== newSoldDate) changes['soldDate'] = { old: currentItem.sold_date, new: newSoldDate };
      updatePayload.sold_date = newSoldDate;

      const newInUseDate = itemData.status === 'in use' ? (itemData.inUseDate ? new Date(itemData.inUseDate).toISOString() : now) : null;
      if (currentItem.in_use_date !== newInUseDate) changes['inUseDate'] = { old: currentItem.in_use_date, new: newInUseDate };
      updatePayload.in_use_date = newInUseDate;

      if (itemData.status === 'in stock') {
        if (currentItem.sold_date !== null) changes['soldDate'] = { old: currentItem.sold_date, new: null };
        updatePayload.sold_date = null;
        if (currentItem.in_use_date !== null) changes['inUseDate'] = { old: currentItem.in_use_date, new: null };
        updatePayload.in_use_date = null;
      }
    } else { 
      if (itemData.hasOwnProperty('soldDate') && currentItem.status === 'sold') {
        const newSoldDate = itemData.soldDate ? new Date(itemData.soldDate).toISOString() : null;
        if(currentItem.sold_date !== newSoldDate) changes['soldDate'] = {old: currentItem.sold_date, new: newSoldDate};
        updatePayload.sold_date = newSoldDate;
      }
      if (itemData.hasOwnProperty('inUseDate') && currentItem.status === 'in use') {
        const newInUseDate = itemData.inUseDate ? new Date(itemData.inUseDate).toISOString() : null;
        if(currentItem.in_use_date !== newInUseDate) changes['inUseDate'] = {old: currentItem.in_use_date, new: newInUseDate};
        updatePayload.in_use_date = newInUseDate;
      }
    }

    if (Object.keys(updatePayload).length > 0) {
        updatePayload.updated_at = now;
    } else {
        return currentItem; 
    }
    
    // Log the payload being sent
    console.log(`[updateItem] Attempting to update item ID '${id}' with user_id filter '${ADMIN_USER_ID}'. Payload:`, JSON.stringify(updatePayload, null, 2));

    const { data: updatedItem, error: updateError } = await supabase
        .from('items')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', ADMIN_USER_ID) // Ensure we only update if the item belongs to the admin user
        .select()
        .single();

    if (updateError) {
        console.error(`[updateItem Supabase Error] Item ID '${id}', User ID '${ADMIN_USER_ID}'. Message: ${updateError.message}. Code: ${updateError.code}. Details: ${updateError.details}. Hint: ${updateError.hint}`);
        console.error("[updateItem Supabase Error] Failing Payload (already logged above):", JSON.stringify(updatePayload, null, 2));
        return { error: "Database operation failed. Please check Supabase Function logs for specific error details. Action: updateItem" };
    }

    if (!updatedItem) {
        console.warn(`[updateItem Warning] No data returned for updatedItem (ID: ${id}) after Supabase update, but no explicit error. This could mean the item ID and user ID combination didn't match any rows for update.`);
        return { error: `Failed to update item (ID: ${id}). No data returned after update operation, possibly because the item was not found with the specified admin user ID. Check Supabase Function logs. Action: updateItem` };
    }

    await logAuditAction('ITEM_UPDATED', {
      target_table: 'items',
      target_record_id: updatedItem.id.toString(),
      details: { name: updatedItem.name, changes },
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
  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return { error: adminUserCheck.error || "Admin user verification failed before deleting item. Check Supabase Function logs." };
  }

  const itemCheckResult = await getItemById(id);
  if (!itemCheckResult || 'error' in itemCheckResult) {
      const preCheckError = (itemCheckResult as {error: string})?.error || "Item not found or access denied during pre-check for delete.";
      console.error(`[deleteItem Pre-check Error] For item ID '${id}': ${preCheckError}`);
      return { error: preCheckError };
  }
  const itemName = (itemCheckResult as Item).name;

  const { error, count } = await supabase
    .from('items')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', ADMIN_USER_ID);

  if (error) {
    console.error(`[deleteItem Supabase Error] Item ID '${id}', User ID '${ADMIN_USER_ID}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`);
    return { error: "Database operation failed. Please check Supabase Function logs for specific error details. Action: deleteItem" };
  }

  if (count === 0) {
    console.warn(`[deleteItem Warning] Item ID '${id}' not found for user '${ADMIN_USER_ID}' during delete, or count was 0.`);
    return { error: `Item with ID '${id}' not found for admin user at time of deletion.` };
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
  } catch (error: any) {
    console.error("[processReceiptImage Genkit Error]", error);
    return { error: `Failed to extract data from receipt: ${error.message || 'Unknown Genkit error'}.` };
  }
}

export async function updateItemStatus(id: string, newStatus: ItemStatus): Promise<Item | { error: string } | undefined> {
    const adminUserCheck = await verifyAdminUserExists();
    if (!adminUserCheck.success) {
      return { error: adminUserCheck.error || "Admin user verification failed before updating item status. Check Supabase Function logs." };
    }
    
    const currentItemResult = await getItemById(id);
    if (!currentItemResult || 'error' in currentItemResult) {
      const preCheckError = (currentItemResult as {error: string})?.error || "Item not found or access denied during pre-check for status update.";
      console.error(`[updateItemStatus Pre-check Error] For item ID '${id}': ${preCheckError}`);
      return { error: preCheckError };
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
    } else { 
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
      console.error(`[updateItemStatus Supabase Error] Item ID '${id}', User ID '${ADMIN_USER_ID}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`);
      return { error: "Database operation failed. Please check Supabase Function logs for specific error details. Action: updateItemStatus" };
    }

    if (updatedItem) {
      await logAuditAction('ITEM_STATUS_CHANGED', {
        target_table: 'items',
        target_record_id: updatedItem.id.toString(),
        details: { name: itemName, oldStatus: oldStatus, newStatus: updatedItem.status },
        description: `Admin changed status of item '${itemName}' (ID: ${updatedItem.id}) from '${oldStatus}' to '${updatedItem.status}'.`
      });
      revalidatePath("/inventory", "layout");
      revalidatePath(`/inventory/${id}`, "layout");
      revalidatePath("/dashboard", "layout");
      revalidatePath("/analytics", "layout");
      return updatedItem as Item;
    }
    console.warn(`[updateItemStatus Warning] No data returned for item ID '${id}' after status update, but no explicit error.`);
    return { error: "Failed to update item status (no data returned). Check Supabase Function logs. Action: updateItemStatus" };
}

export async function bulkDeleteItems(itemIds: string[]): Promise<{ success: boolean; message?: string }> {
  if (itemIds.length === 0) return { success: false, message: "No items selected."};

  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return { success: false, message: adminUserCheck.error || "Admin user verification failed. Operation aborted. Check Supabase Function logs." };
  }

  const { error, count } = await supabase
    .from('items')
    .delete({ count: 'exact' })
    .in('id', itemIds)
    .eq('user_id', ADMIN_USER_ID);

  if (error) {
    console.error(`[bulkDeleteItems Supabase Error] User ID '${ADMIN_USER_ID}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`);
    return { success: false, message: "Database operation failed during bulk delete. Check Supabase Function logs." };
  }
  if (count && count > 0) {
    await logAuditAction('ITEMS_BULK_DELETED', {
        target_table: 'items',
        details: { itemCount: count, itemIds },
        target_record_id: null,
        description: `Admin bulk deleted ${count} item(s).`
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return { success: true, message: `${count} item(s) for admin user deleted successfully.` };
  }
  return { success: false, message: `No matching items for admin user found to delete or none selected.` };
}

export async function bulkUpdateItemStatus(itemIds: string[], newStatus: ItemStatus): Promise<{ success: boolean; message?: string }> {
  if (itemIds.length === 0) return { success: false, message: "No items selected."};
  
  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return { success: false, message: adminUserCheck.error || "Admin user verification failed. Operation aborted. Check Supabase Function logs." };
  }

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

  const { error, count } = await supabase
    .from('items')
    .update(updatePayload)
    .in('id', itemIds)
    .eq('user_id', ADMIN_USER_ID)
    .select({count: 'exact'}); 

  if (error) {
    console.error(`[bulkUpdateItemStatus Supabase Error] User ID '${ADMIN_USER_ID}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`);
    return { success: false, message: "Database operation failed during bulk status update. Check Supabase Function logs." };
  }

  const updatedCount = count || 0;

  if (updatedCount > 0) {
    await logAuditAction('ITEMS_BULK_STATUS_CHANGED', {
        target_table: 'items',
        details: { itemCount: updatedCount, itemIds, newStatus },
        target_record_id: null,
        description: `Admin bulk updated status of ${updatedCount} item(s) to '${newStatus}'.`
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    itemIds.forEach(id => revalidatePath(`/inventory/${id}`, "layout"));
    return { success: true, message: `${updatedCount} item(s) for admin user status updated to ${newStatus}.` };
  }
  return { success: false, message: `No matching items for admin user found to update or none selected.` };
}

export async function getUniqueCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('items')
    .select('category')
    .eq('user_id', ADMIN_USER_ID)
    .not('category', 'is', null); 

  if (error) {
    console.error(`[getUniqueCategories Supabase Error] User ID '${ADMIN_USER_ID}'. Message: ${error.message}.`);
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
    console.error(`[getManagedOptions Supabase Error] Type '${optionType}', User ID '${ADMIN_USER_ID}'. Message: ${error.message}.`);
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
  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return { success: false, message: adminUserCheck.error || "Admin user verification failed. Operation aborted. Check Supabase Function logs." };
  }

  const singularName = optionTypeToSingularName[optionType];

  if (!name || name.trim() === "") {
    return { success: false, message: `${singularName} name cannot be empty.` };
  }
  const trimmedName = name.trim();

  const { data: existing, error: selectError } = await supabase
    .from('managed_options')
    .select('id')
    .eq('type', optionType)
    .ilike('name', trimmedName)
    .eq('user_id', ADMIN_USER_ID)
    .limit(1)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { 
      console.error(`[addManagedOption Select Error] Type: ${optionType}, Name: ${trimmedName}, User ID '${ADMIN_USER_ID}'. Message: ${selectError.message}.`);
      return { success: false, message: `Database operation failed. Check Supabase Function logs. Action: addManagedOption (check existing)` };
  }
  if (existing) {
    return { success: false, message: `${singularName} "${trimmedName}" already exists for this user.` };
  }

  const { data: newOption, error: insertError } = await supabase
    .from('managed_options')
    .insert({
      name: trimmedName,
      type: optionType,
      user_id: ADMIN_USER_ID,
    })
    .select('id, name')
    .single();

  if (insertError || !newOption) {
    console.error(`[addManagedOption Insert Error] Type: ${optionType}, Name: ${trimmedName}, User ID '${ADMIN_USER_ID}'. Message: ${insertError?.message}.`);
    return { success: false, message: `Database operation failed. Check Supabase Function logs. Action: addManagedOption (insert)` };
  }

  await logAuditAction('MANAGED_OPTION_CREATED', {
    target_table: 'managed_options',
    target_record_id: newOption.id.toString(),
    details: { optionType: optionType, name: newOption.name },
    description: `Admin created ${singularName} option: '${newOption.name}'.`
  });

  const updatedOptions = await getManagedOptions(optionType);
  const settingsPagePath = `/settings/${optionType.replace(/_/g, '-') + 's'}`; 
  revalidatePath(settingsPagePath, "page");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return { success: true, message: `${singularName} "${trimmedName}" added.`, options: updatedOptions };
}

async function deleteManagedOption(name: string, optionType: OptionType): Promise<{ success: boolean; message?: string; options?: string[] }> {
  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return { success: false, message: adminUserCheck.error || "Admin user verification failed. Operation aborted. Check Supabase Function logs." };
  }
  
  const singularName = optionTypeToSingularName[optionType];

  const { data: optionToDelete, error: fetchError } = await supabase
    .from('managed_options')
    .select('id')
    .eq('type', optionType)
    .eq('name', name)
    .eq('user_id', ADMIN_USER_ID)
    .single();

  if (fetchError || !optionToDelete) {
      console.error(`[deleteManagedOption Fetch Error] Type: ${optionType}, Name: ${name}, User ID '${ADMIN_USER_ID}'. Message: ${fetchError?.message}.`);
      if (fetchError?.code === 'PGRST116') return { success: false, message: `${singularName} "${name}" not found.` };
      return { success: false, message: `Database operation failed. Check Supabase Function logs. Action: deleteManagedOption (fetch)` };
  }

  const { error, count } = await supabase
    .from('managed_options')
    .delete({ count: 'exact' })
    .eq('id', optionToDelete.id); 

  if (error) {
    console.error(`[deleteManagedOption Delete Error] Type: ${optionType}, Name: ${name}, ID: ${optionToDelete.id}. Message: ${error.message}.`);
    return { success: false, message: `Database operation failed. Check Supabase Function logs. Action: deleteManagedOption (delete)` };
  }

  if (count === 0) {
     return { success: false, message: `${singularName} "${name}" not found for deletion (count was 0), possibly already deleted.` };
  }

  await logAuditAction('MANAGED_OPTION_DELETED', {
    target_table: 'managed_options',
    target_record_id: optionToDelete.id.toString(),
    details: { optionType: optionType, name: name },
    description: `Admin deleted ${singularName} option: '${name}'.`
  });

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
  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return { success: false, message: adminUserCheck.error || "Admin user verification failed. Operation aborted. Check Supabase Function logs." };
  }

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
    console.error(`[bulkDeleteManagedOptions Supabase Error] Type: ${optionType}, User ID '${ADMIN_USER_ID}'. Message: ${error.message}.`);
    return { success: false, message: `Database operation failed. Check Supabase Function logs. Action: bulkDeleteManagedOptions` };
  }

  const deletedCount = count || 0;

  if (deletedCount > 0) {
    await logAuditAction('MANAGED_OPTIONS_BULK_DELETED', {
        target_table: 'managed_options',
        details: { optionType: optionType, count: deletedCount, names }, 
        target_record_id: null, 
        description: `Admin bulk deleted ${deletedCount} ${singularName.toLowerCase()} option(s): ${names.join(', ')}.`
    });
    const settingsPagePath = `/settings/${optionType.replace(/_/g, '-') + 's'}`;
    revalidatePath(settingsPagePath, "page");
    revalidatePath("/inventory/add", "layout");
    revalidatePath("/inventory/[id]/edit", "layout");
    return { success: true, message: `${deletedCount} ${singularName.toLowerCase()}(s) deleted successfully.`, count: deletedCount };
  } else if (deletedCount === 0) {
    return { success: false, message: `No matching ${singularName.toLowerCase()}s found for deletion.` };
  }
  return { success: false, message: `An issue occurred while deleting ${singularName.toLowerCase()}s (count: ${deletedCount}).` };
}


export interface BulkImportResult {
  successCount: number;
  errorCount: number;
  errors: { rowNumber: number; message: string; rowData: string }[];
}

export async function bulkImportItems(csvFileContent: string): Promise<BulkImportResult> {
  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return { 
      successCount: 0, 
      errorCount: 1, 
      errors: [{ rowNumber: 0, message: adminUserCheck.error || "Admin user verification failed. Bulk import aborted. Check Supabase Function logs.", rowData: "PRE-CHECK FAILED" }] 
    };
  }

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
      }
    } catch (error: any) {
      results.errorCount++;
      results.errors.push({ rowNumber, message: error.message || "Failed to add item.", rowData: line });
    }
  }

  if (results.successCount > 0) {
     await logAuditAction('ITEMS_BULK_IMPORTED', {
        target_table: 'items', 
        details: {
            successCount: results.successCount,
            errorCount: results.errorCount,
        },
        target_record_id: null,
        description: `Admin bulk imported ${results.successCount} item(s) successfully, ${results.errorCount} failed.`
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
  }
  return results;
}

