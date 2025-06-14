"use server";

import {
  receiptDataExtraction,
  type ReceiptDataExtractionInput,
  type ReceiptDataExtractionOutput,
} from "@/ai/flows/receipt-data-extraction";
import { supabase } from "@/lib/supabase/client";
import type { Item, ItemInput, ItemStatus } from "@/types/item";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const ADMIN_USER_ID = "047dd250-5c94-44f2-8827-6ff6bff8207c"; // User ID for "stock_sentry_admin"

function getBaseUrl(): string {
  // Try environment variable first (for production deployments)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Try to get from request headers (dynamic detection)
  try {
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch (error) {
    console.warn('[getBaseUrl] Could not determine URL from headers:', error);
  }
  
  // Fallback for development
  return 'http://localhost:3000';
}

async function verifyAdminUserExists(): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log(
    `[Admin User Verification] Attempting to verify ADMIN_USER_ID: '${ADMIN_USER_ID}' from within Supabase Function.`
  );
  const { data, error } = await supabase
    .from("stock_sentry_users")
    .select("id")
    .eq("id", ADMIN_USER_ID)
    .maybeSingle();

  if (error) {
    console.error(
      `[Admin User Verification Error] Supabase query failed for ADMIN_USER_ID '${ADMIN_USER_ID}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`
    );
    return {
      success: false,
      error: `Database error during admin user verification from Supabase Function. Check Function logs for detailed Supabase error. Action: verifyAdminUserExists`,
    };
  }
  if (!data) {
    console.error(
      `[Admin User Verification Error] ADMIN_USER_ID '${ADMIN_USER_ID}' not found in stock_sentry_users table by the Supabase Function.`
    );
    return {
      success: false,
      error: `Configured ADMIN_USER_ID '${ADMIN_USER_ID}' not found in the users table by the Supabase Function. Please check configuration, RLS (if any on stock_sentry_users), and Supabase Function environment/permissions. Action: verifyAdminUserExists`,
    };
  }
  console.log(
    `[Admin User Verification Success] ADMIN_USER_ID '${ADMIN_USER_ID}' successfully verified by the Supabase Function.`
  );
  return { success: true };
}

async function logAuditAction(
  action_type: string,
  params: {
    target_table?: string;
    target_record_id?: string | null;
    details?: unknown;
    description?: string;
  }
) {
  try {
    const { error } = await supabase.from("audit_log").insert({
      user_id: ADMIN_USER_ID,
      action_type,
      target_table: params.target_table,
      target_record_id: params.target_record_id || null,
      details: params.details,
      description: params.description,
    });
    if (error) {
      console.error(
        `[Audit Log Error] Failed to log action '${action_type}'. User ID '${ADMIN_USER_ID}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}. Params:`,
        params
      );
    }
  } catch (e) {
    console.error(
      `[Audit Log Exception] Exception during logging action '${action_type}':`,
      e
    );
  }
}

async function seedAdminUserOptions(
  optionType: string,
  defaultOptions: string[]
) {
  const { data: existingOptions, error: fetchError } = await supabase
    .from("managed_options")
    .select("name", { count: "exact" })
    .eq("user_id", ADMIN_USER_ID) // Seeding is still tied to admin user
    .eq("type", optionType);

  if (fetchError) {
    return;
  }

  const currentCount = existingOptions?.length || 0;

  if (currentCount === 0) {
    const optionsToInsert = defaultOptions.map((name) => ({
      name,
      type: optionType,
      user_id: ADMIN_USER_ID,
    }));

    if (optionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("managed_options")
        .insert(optionsToInsert);
      if (insertError) {
        console.error("Error inserting default options", insertError);
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

export async function getItems(
  filters?: ItemFilters
): Promise<{ items: Item[]; totalPages: number; count: number }> {
  // user_id filter removed for global item listing
  let query = supabase.from("items").select("*", { count: "exact" });

  if (filters) {
    if (filters.name && filters.name.trim() !== "") {
      query = query.ilike("name", `%${filters.name.trim()}%`);
    }
    if (filters.category && filters.category.trim() !== "") {
      query = query.eq("category", filters.category.trim());
    }
  }

  query = query.order("created_at", { ascending: false });

  // Count query also removes user_id filter
  const countQueryBuilder = supabase
    .from("items")
    .select("id", { count: "exact", head: true });

  if (filters?.name && filters.name.trim() !== "") {
    countQueryBuilder.ilike("name", `%${filters.name.trim()}%`);
  }
  if (filters?.category && filters.category.trim() !== "") {
    countQueryBuilder.eq("category", filters.category.trim());
  }

  const { count: totalMatchingCount, error: countError } =
    await countQueryBuilder;

  if (countError) {
    console.error(
      `[getItems Count Error] Message: ${countError.message}. Code: ${countError.code}. Details: ${countError.details}. Hint: ${countError.hint}`
    );
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
    console.error(
      `[getItems Data Error] Message: ${dataError.message}. Code: ${dataError.code}. Details: ${dataError.details}. Hint: ${dataError.hint}`
    );
    return { items: [], totalPages: 0, count: 0 };
  }

  // Map snake_case to camelCase for frontend
  const items = (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    quantity: row.quantity,
    category: row.category,
    subcategory: row.subcategory,
    storageLocation: row.storage_location,
    binLocation: row.bin_location,
    room: row.room,
    vendor: row.vendor,
    project: row.project,
    originalPrice: row.original_price,
    salesPrice: row.sales_price,
    msrp: row.msrp,
    sku: row.sku,
    status: row.status,
    barcodeData: row.barcode_data,
    qrCodeData: row.qr_code_data,
    receiptImageUrl: row.receipt_image_url,
    productImageUrl: row.product_image_url,
    productUrl: row.product_url,
    purchaseDate: row.purchase_date,
    soldDate: row.sold_date,
    inUseDate: row.in_use_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { items, totalPages, count: totalItems };
}

export async function getItemById(id: string) {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`[getItemById Error] Item ID '${id}':`, error);
      return { error: error.message };
    }

    // Map snake_case to camelCase for frontend
    const item = {
      id: data.id,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      category: data.category,
      subcategory: data.subcategory,
      storageLocation: data.storage_location,
      binLocation: data.bin_location,
      room: data.room,
      vendor: data.vendor,
      project: data.project,
      originalPrice: data.original_price,
      salesPrice: data.sales_price,
      msrp: data.msrp,
      sku: data.sku,
      status: data.status,
      barcodeData: data.barcode_data,
      qrCodeData: data.qr_code_data,
      receiptImageUrl: data.receipt_image_url,
      productImageUrl: data.product_image_url,
      productUrl: data.product_url,
      purchaseDate: data.purchase_date,
      soldDate: data.sold_date,
      inUseDate: data.in_use_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return item;
  } catch (error) {
    console.error("[getItemById Error]", error);
    return { error: "Failed to get item" };
  }
}

export async function createItem(itemData: ItemInput) {
  try {
    console.log("[createItem] Input data:", JSON.stringify(itemData, null, 2));
    
    // First insert without barcode/QR code data to get the item ID
    const tempPayload = {
      name: itemData.name,
      description: itemData.description,
      quantity: itemData.quantity,
      category: itemData.category,
      subcategory: itemData.subcategory,
      storage_location: itemData.storageLocation,
      bin_location: itemData.binLocation,
      room: itemData.room,
      vendor: itemData.vendor,
      project: itemData.project,
      original_price: itemData.originalPrice,
      sales_price: itemData.salesPrice,
      msrp: itemData.msrp,
      sku: itemData.sku,
      status: itemData.status,
      receipt_image_url: itemData.receiptImageUrl,
      product_image_url: itemData.productImageUrl,
      product_url: itemData.productUrl,
      purchase_date: itemData.purchaseDate,
      sold_date: itemData.soldDate,
      in_use_date: itemData.inUseDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: tempData, error: tempError } = await supabase
      .from("items")
      .insert([tempPayload])
      .select()
      .single();

    if (tempError) {
      console.error(`[createItem Supabase Error] Full error:`, tempError);
      return { error: `Database error: ${tempError.message}` };
    }

    // Generate barcode and QR code data using the item ID
    const itemId = tempData.id;
    const baseUrl = getBaseUrl();
    
    // Generate barcode data: use SKU if available, otherwise use item ID
    const barcodeData = itemData.sku || itemId;
    
    // Generate QR code data: URL to the item detail page
    const qrCodeData = `${baseUrl}/inventory/${itemId}`;
    
    // Update the item with generated barcode and QR code data
    const { data, error } = await supabase
      .from("items")
      .update({
        barcode_data: barcodeData,
        qr_code_data: qrCodeData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error(`[createItem Update Error] Full error:`, error);
      return { error: `Database error: ${error.message}` };
    }

    console.log("[createItem] Success with generated codes:", data);
    
    // Map the response back to camelCase for frontend
    const item = {
      id: data.id,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      category: data.category,
      subcategory: data.subcategory,
      storageLocation: data.storage_location,
      binLocation: data.bin_location,
      room: data.room,
      vendor: data.vendor,
      project: data.project,
      originalPrice: data.original_price,
      salesPrice: data.sales_price,
      msrp: data.msrp,
      sku: data.sku,
      status: data.status,
      barcodeData: data.barcode_data,
      qrCodeData: data.qr_code_data,
      receiptImageUrl: data.receipt_image_url,
      productImageUrl: data.product_image_url,
      productUrl: data.product_url,
      purchaseDate: data.purchase_date,
      soldDate: data.sold_date,
      inUseDate: data.in_use_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Log audit action
    await logAuditAction("create_item", {
      target_table: "items",
      target_record_id: data.id,
      details: { item: item },
      description: `Item '${item.name}' created with auto-generated barcode: '${barcodeData}' and QR code: '${qrCodeData}'`,
    });

    revalidatePath("/inventory");
    revalidatePath(`/inventory/${data.id}`);
    
    return item;
  } catch (error) {
    console.error("[createItem Error]", error);
    return { error: "Failed to create item" };
  }
}

export async function updateItem(id: string, updateData: Partial<ItemInput>) {
  try {
    console.log(`[updateItem Debug] Starting update for Item ID: ${id}`);
    
    // Get the existing item first to preserve created_at and other fields
    const existingItem = await getItemById(id);
    if (!existingItem || 'error' in existingItem) {
      return { error: "Item not found" };
    }

    // Generate updated barcode and QR code data
    const baseUrl = getBaseUrl();
    const barcodeData = updateData.sku || id; // Use updated SKU if available, otherwise use item ID
    const qrCodeData = `${baseUrl}/inventory/${id}`;

    // Map camelCase to snake_case for database and preserve existing data
    const payload = {
      id: id, // Keep the same ID
      name: updateData.name,
      description: updateData.description,
      quantity: updateData.quantity,
      category: updateData.category,
      subcategory: updateData.subcategory,
      storage_location: updateData.storageLocation,
      bin_location: updateData.binLocation,
      room: updateData.room,
      vendor: updateData.vendor,
      project: updateData.project,
      original_price: updateData.originalPrice,
      sales_price: updateData.salesPrice,
      msrp: updateData.msrp,
      sku: updateData.sku,
      status: updateData.status,
      barcode_data: barcodeData,
      qr_code_data: qrCodeData,
      receipt_image_url: updateData.receiptImageUrl,
      product_image_url: updateData.productImageUrl,
      product_url: updateData.productUrl,
      purchase_date: updateData.purchaseDate,
      sold_date: updateData.soldDate,
      in_use_date: updateData.inUseDate,
      created_at: existingItem.createdAt, // Preserve original creation date
      updated_at: new Date().toISOString(),
    };

    console.log(`[updateItem] Attempting delete and recreate for item ID '${id}'`);

    // Delete the existing item
    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(`[updateItem Delete Error] ${deleteError.message}`);
      return { error: deleteError.message };
    }

    // Insert the updated item with the same ID
    const { data, error: insertError } = await supabase
      .from("items")
      .insert([payload])
      .select()
      .single();

    if (insertError) {
      console.error(`[updateItem Insert Error] ${insertError.message}`);
      return { error: insertError.message };
    }

    console.log(`[updateItem Success] Item ID '${id}' updated via delete/insert`);
    
    // Map the response back to camelCase for frontend
    const item = {
      id: data.id,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      category: data.category,
      subcategory: data.subcategory,
      storageLocation: data.storage_location,
      binLocation: data.bin_location,
      room: data.room,
      vendor: data.vendor,
      project: data.project,
      originalPrice: data.original_price,
      salesPrice: data.sales_price,
      msrp: data.msrp,
      sku: data.sku,
      status: data.status,
      barcodeData: data.barcode_data,
      qrCodeData: data.qr_code_data,
      receiptImageUrl: data.receipt_image_url,
      productImageUrl: data.product_image_url,
      productUrl: data.product_url,
      purchaseDate: data.purchase_date,
      soldDate: data.sold_date,
      inUseDate: data.in_use_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Log audit action
    await logAuditAction("update_item", {
      target_table: "items",
      target_record_id: data.id,
      details: { item: item },
      description: `Item '${item.name}' updated with regenerated barcode: '${barcodeData}' and QR code: '${qrCodeData}'`,
    });

    revalidatePath("/inventory");
    revalidatePath(`/inventory/${data.id}`);
    
    return item;
  } catch (error) {
    console.error("[updateItem Error]", error);
    return { error: "Failed to update item" };
  }
}

export async function deleteItem(id: string) {
  try {
    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) {
      console.error(
        `[deleteItem Error] Item ID '${id}'. Message: ${error.message}`
      );
      return { error: error.message };
    }

    return { data: true };
  } catch (error) {
    console.error("[deleteItem Error]", error);
    return { error: "Failed to delete item" };
  }
}

export async function processReceiptImage(
  receiptImage: string
): Promise<ReceiptDataExtractionOutput | { error: string }> {
  try {
    const input: ReceiptDataExtractionInput = { receiptImage };
    const extractedData = await receiptDataExtraction(input);
    if (!extractedData.items) {
      return { ...extractedData, items: [] };
    }
    return extractedData;
  } catch (error: unknown) {
    console.error("[processReceiptImage Genkit Error]", error);
    return {
      error: `Failed to extract data from receipt: ${
        (error as Error).message || "Unknown Genkit error"
      }. Action: processReceiptImage`,
    };
  }
}

export async function updateItemStatus(
  id: string,
  newStatus: ItemStatus
): Promise<Item | { error: string } | undefined> {
  const currentItemResult = await getItemById(id); // getItemById is now global
  if (!currentItemResult || "error" in currentItemResult) {
    const preCheckError =
      (currentItemResult as { error: string })?.error ||
      "Item not found or access denied during pre-check for status update.";
    console.error(
      `[updateItemStatus Pre-check Error] For item ID '${id}': ${preCheckError}`
    );
    return { error: preCheckError };
  }

  const currentItem = currentItemResult as Item;
  const oldStatus = currentItem.status;
  const itemName = currentItem.name;

  const updatePayload: Record<string, unknown> = { status: newStatus };
  const now = new Date().toISOString();

  if (newStatus === "sold") {
    updatePayload.sold_date = currentItem.soldDate || now;
    updatePayload.in_use_date = null;
  } else if (newStatus === "in use") {
    updatePayload.in_use_date = currentItem.inUseDate || now;
    updatePayload.sold_date = null;
  } else {
    updatePayload.sold_date = null;
    updatePayload.in_use_date = null;
  }
  updatePayload.updated_at = now;

  const { data: updatedItem, error } = await supabase
    .from("items")
    .update(updatePayload)
    .eq("id", id) // user_id filter removed
    .select()
    .single();

  if (error) {
    console.error(
      `[updateItemStatus Supabase Error] Item ID '${id}'. Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`
    );
    return {
      error:
        "Database operation failed. Please check Supabase Function logs for specific error details. Action: updateItemStatus",
    };
  }

  if (updatedItem) {
    await logAuditAction("ITEM_STATUS_CHANGED", {
      target_table: "items",
      target_record_id: updatedItem.id.toString(),
      details: {
        name: itemName,
        oldStatus: oldStatus,
        newStatus: updatedItem.status,
      },
      description: `Admin changed status of item '${itemName}' (ID: ${updatedItem.id}) from '${oldStatus}' to '${updatedItem.status}'.`,
    });
    revalidatePath("/inventory", "layout");
    revalidatePath(`/inventory/${id}`, "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return updatedItem as Item;
  }
  console.warn(
    `[updateItemStatus Warning] No data returned for item ID '${id}' after status update, but no explicit error.`
  );
  return {
    error:
      "Failed to update item status (no data returned). Check Supabase Function logs. Action: updateItemStatus",
  };
}

export async function bulkDeleteItems(
  itemIds: string[]
): Promise<{ success: boolean; message?: string }> {
  if (itemIds.length === 0)
    return { success: false, message: "No items selected." };

  // No admin user verification needed here for delete if by ID only.

  const { error, count } = await supabase
    .from("items")
    .delete({ count: "exact" })
    .in("id", itemIds); // user_id filter removed

  if (error) {
    console.error(
      `[bulkDeleteItems Supabase Error] Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`
    );
    return {
      success: false,
      message:
        "Database operation failed during bulk delete. Check Supabase Function logs. Action: bulkDeleteItems",
    };
  }
  if (count && count > 0) {
    await logAuditAction("ITEMS_BULK_DELETED", {
      target_table: "items",
      details: { itemCount: count, itemIds },
      target_record_id: null,
      description: `Admin bulk deleted ${count} item(s). IDs: ${itemIds.join(
        ", "
      )}`,
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return { success: true, message: `${count} item(s) deleted successfully.` };
  }
  return {
    success: false,
    message: `No matching items found to delete or none selected.`,
  };
}

export async function bulkUpdateItemStatus(
  itemIds: string[],
  newStatus: ItemStatus
): Promise<{ success: boolean; message?: string }> {
  if (itemIds.length === 0)
    return { success: false, message: "No items selected." };

  // No admin user verification needed if update is by ID only.

  const updatePayload: Record<string, unknown> = { status: newStatus };
  const now = new Date().toISOString();

  if (newStatus === "sold") {
    updatePayload.sold_date = now;
    updatePayload.in_use_date = null;
  } else if (newStatus === "in use") {
    updatePayload.in_use_date = now;
    updatePayload.sold_date = null;
  } else {
    updatePayload.sold_date = null;
    updatePayload.in_use_date = null;
  }
  updatePayload.updated_at = now;

  const { error, data } = await supabase
    .from("items")
    .update(updatePayload)
    .in("id", itemIds) // user_id filter removed
    .select("*");

  if (error) {
    console.error(
      `[bulkUpdateItemStatus Supabase Error] Message: ${error.message}. Code: ${error.code}. Details: ${error.details}. Hint: ${error.hint}`
    );
    return {
      success: false,
      message:
        "Database operation failed during bulk status update. Check Supabase Function logs. Action: bulkUpdateItemStatus",
    };
  }

  const updatedCount = data?.length || 0;

  if (updatedCount > 0) {
    await logAuditAction("ITEMS_BULK_STATUS_CHANGED", {
      target_table: "items",
      details: { itemCount: updatedCount, itemIds, newStatus },
      target_record_id: null,
      description: `Admin bulk updated status of ${updatedCount} item(s) to '${newStatus}'. IDs: ${itemIds.join(
        ", "
      )}`,
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    itemIds.forEach((id) => revalidatePath(`/inventory/${id}`, "layout"));
    return {
      success: true,
      message: `${updatedCount} item(s) status updated to ${newStatus}.`,
    };
  }
  return {
    success: false,
    message: `No matching items found to update or none selected.`,
  };
}

export async function getUniqueCategories(): Promise<string[]> {
  // user_id filter removed
  const { data, error } = await supabase
    .from("items")
    .select("category")
    .not("category", "is", null);

  if (error) {
    console.error(
      `[getUniqueCategories Supabase Error] Message: ${error.message}.`
    );
    return [];
  }
  if (!data) return [];

  const categories = Array.from(
    new Set(
      data
        .map((item) => item.category)
        .filter((value): value is string => typeof value === "string")
    )
  ).sort();
  return categories;
}

const defaultManagedCategories = [
  "Electronics",
  "Accessories",
  "Office Supplies",
  "Furniture",
  "Appliances",
  "Software",
  "Miscellaneous",
  "Lighting",
];
const defaultManagedSubcategories = [
  "Peripherals",
  "Computer Accessories",
  "Cables",
  "Lighting",
  "Kitchen Appliances",
  "Productivity Tools",
  "Decor",
  "Desks",
  "Desk Lamps",
];
const defaultManagedStorageLocations = [
  "Warehouse A",
  "Warehouse B",
  "Office Shelf",
  "Storage Closet",
  "Remote Site",
  "Main Stockroom",
  "Showroom",
  "Kitchen Area",
  "Drawer C",
  "Pantry",
  "Drawer B",
];
const defaultManagedBinLocations = [
  "A-01",
  "A-02",
  "A-03",
  "B-01",
  "C-01",
  "Shelf A1",
  "Shelf A2",
  "Shelf 1-A",
  "Shelf 1-B",
  "Shelf 1-C",
  "Shelf 2-A",
  "Drawer X",
  "Pallet 5",
  "Section 1",
  "Section 2",
  "Bin 1",
  "Bin 3",
  "Display A",
  "Counter Top",
];
const defaultManagedRooms = [
  "Main Office",
  "Tech Closet",
  "Server Room",
  "Conference Room A",
  "Break Room",
  "Storage Unit 1",
];
const defaultManagedVendors = [
  "TechSupply Co.",
  "Keychron",
  "Accessory King",
  "StandUp Inc.",
  "Lights R Us",
  "Office Essentials",
  "Generic Supplier",
];
const defaultManagedProjects = [
  "Office Upgrade",
  "Gaming Setup",
  "General Stock",
  "Ergonomics Improvement",
  "New Office Setup",
  "Client Project X",
  "Internal R&D",
];

export type OptionType =
  | "category"
  | "subcategory"
  | "storage_location"
  | "bin_location"
  | "room"
  | "vendor"
  | "project";

const optionTypeToDefaultsMap: Record<OptionType, string[]> = {
  category: defaultManagedCategories,
  subcategory: defaultManagedSubcategories,
  storage_location: defaultManagedStorageLocations,
  bin_location: defaultManagedBinLocations,
  room: defaultManagedRooms,
  vendor: defaultManagedVendors,
  project: defaultManagedProjects,
};
const optionTypeToSingularName: Record<OptionType, string> = {
  category: "Category",
  subcategory: "Subcategory",
  storage_location: "Storage Location",
  bin_location: "Bin Location",
  room: "Room",
  vendor: "Vendor",
  project: "Project",
};

async function getManagedOptions(optionType: OptionType): Promise<string[]> {
  // Seeding is still tied to admin user
  await seedAdminUserOptions(optionType, optionTypeToDefaultsMap[optionType]);

  // user_id filter removed for global options
  const { data, error } = await supabase
    .from("managed_options")
    .select("name")
    .eq("type", optionType)
    // .eq('user_id', ADMIN_USER_ID) // Removed for global options
    .order("name", { ascending: true });

  if (error) {
    console.error(
      `[getManagedOptions Supabase Error] Type '${optionType}'. Message: ${error.message}.`
    );
    return [];
  }
  return data ? data.map((opt) => opt.name) : [];
}

export async function getManagedCategoryOptions(): Promise<string[]> {
  return getManagedOptions("category");
}
export async function getManagedSubcategoryOptions(): Promise<string[]> {
  return getManagedOptions("subcategory");
}
export async function getManagedStorageLocationOptions(): Promise<string[]> {
  return getManagedOptions("storage_location");
}
export async function getManagedBinLocationOptions(): Promise<string[]> {
  return getManagedOptions("bin_location");
}
export async function getManagedRoomOptions(): Promise<string[]> {
  return getManagedOptions("room");
}
export async function getManagedVendorOptions(): Promise<string[]> {
  return getManagedOptions("vendor");
}
export async function getManagedProjectOptions(): Promise<string[]> {
  return getManagedOptions("project");
}

async function addManagedOption(
  name: string,
  optionType: OptionType
): Promise<{ success: boolean; message?: string; options?: string[] }> {
  // Still verify admin user as options are inserted with ADMIN_USER_ID due to schema
  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return {
      success: false,
      message:
        adminUserCheck.error ||
        "Admin user verification failed. Operation aborted. Action: addManagedOption",
    };
  }

  const singularName = optionTypeToSingularName[optionType];

  if (!name || name.trim() === "") {
    return { success: false, message: `${singularName} name cannot be empty.` };
  }
  const trimmedName = name.trim();

  // Check for uniqueness globally for that type if user_id is removed from this check
  const { data: existing, error: selectError } = await supabase
    .from("managed_options")
    .select("id")
    .eq("type", optionType)
    .ilike("name", trimmedName)
    // .eq('user_id', ADMIN_USER_ID) // Removed, check globally for type and name
    .limit(1)
    .single();

  if (selectError && selectError.code !== "PGRST116") {
    console.error(
      `[addManagedOption Select Error] Type: ${optionType}, Name: ${trimmedName}. Message: ${selectError.message}.`
    );
    return {
      success: false,
      message: `Database operation failed. Check Supabase Function logs. Action: addManagedOption (check existing)`,
    };
  }
  if (existing) {
    return {
      success: false,
      message: `${singularName} "${trimmedName}" already exists.`,
    };
  }

  const { data: newOption, error: insertError } = await supabase
    .from("managed_options")
    .insert({
      name: trimmedName,
      type: optionType,
      user_id: ADMIN_USER_ID, // Still setting user_id due to schema
    })
    .select("id, name")
    .single();

  if (insertError || !newOption) {
    console.error(
      `[addManagedOption Insert Error] Type: ${optionType}, Name: ${trimmedName}, User ID '${ADMIN_USER_ID}'. Message: ${insertError?.message}.`
    );
    return {
      success: false,
      message: `Database operation failed. Check Supabase Function logs. Action: addManagedOption (insert)`,
    };
  }

  await logAuditAction("MANAGED_OPTION_CREATED", {
    target_table: "managed_options",
    target_record_id: newOption.id.toString(),
    details: { optionType: optionType, name: newOption.name },
    description: `Admin created ${singularName} option: '${newOption.name}'.`,
  });

  const updatedOptions = await getManagedOptions(optionType);
  const settingsPagePath = `/settings/${optionType.replace(/_/g, "-") + "s"}`;
  revalidatePath(settingsPagePath, "page");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return {
    success: true,
    message: `${singularName} "${trimmedName}" added.`,
    options: updatedOptions,
  };
}

async function deleteManagedOption(
  name: string,
  optionType: OptionType
): Promise<{ success: boolean; message?: string; options?: string[] }> {
  // No admin user verification needed if delete is by name/type globally

  const singularName = optionTypeToSingularName[optionType];

  const { data: optionToDelete, error: fetchError } = await supabase
    .from("managed_options")
    .select("id")
    .eq("type", optionType)
    .eq("name", name)
    // .eq('user_id', ADMIN_USER_ID) // Removed for global deletion by name/type
    .single();

  if (fetchError || !optionToDelete) {
    console.error(
      `[deleteManagedOption Fetch Error] Type: ${optionType}, Name: ${name}. Message: ${fetchError?.message}.`
    );
    if (fetchError?.code === "PGRST116")
      return {
        success: false,
        message: `${singularName} "${name}" not found.`,
      };
    return {
      success: false,
      message: `Database operation failed. Check Supabase Function logs. Action: deleteManagedOption (fetch)`,
    };
  }

  const { error, count } = await supabase
    .from("managed_options")
    .delete({ count: "exact" })
    .eq("id", optionToDelete.id); // Delete by specific ID

  if (error) {
    console.error(
      `[deleteManagedOption Delete Error] Type: ${optionType}, Name: ${name}, ID: ${optionToDelete.id}. Message: ${error.message}.`
    );
    return {
      success: false,
      message: `Database operation failed. Check Supabase Function logs. Action: deleteManagedOption (delete)`,
    };
  }

  if (count === 0) {
    return {
      success: false,
      message: `${singularName} "${name}" not found for deletion (count was 0).`,
    };
  }

  await logAuditAction("MANAGED_OPTION_DELETED", {
    target_table: "managed_options",
    target_record_id: optionToDelete.id.toString(),
    details: { optionType: optionType, name: name },
    description: `Admin deleted ${singularName} option: '${name}'.`,
  });

  const updatedOptions = await getManagedOptions(optionType);
  const settingsPagePath = `/settings/${optionType.replace(/_/g, "-") + "s"}`;
  revalidatePath(settingsPagePath, "page");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return {
    success: true,
    message: `${singularName} "${name}" deleted.`,
    options: updatedOptions,
  };
}

export async function addManagedCategoryOption(name: string) {
  return addManagedOption(name, "category");
}
export async function deleteManagedCategoryOption(name: string) {
  return deleteManagedOption(name, "category");
}
export async function addManagedSubcategoryOption(name: string) {
  return addManagedOption(name, "subcategory");
}
export async function deleteManagedSubcategoryOption(name: string) {
  return deleteManagedOption(name, "subcategory");
}
export async function addManagedStorageLocationOption(name: string) {
  return addManagedOption(name, "storage_location");
}
export async function deleteManagedStorageLocationOption(name: string) {
  return deleteManagedOption(name, "storage_location");
}
export async function addManagedBinLocationOption(name: string) {
  return addManagedOption(name, "bin_location");
}
export async function deleteManagedBinLocationOption(name: string) {
  return deleteManagedOption(name, "bin_location");
}
export async function addManagedRoomOption(name: string) {
  return addManagedOption(name, "room");
}
export async function deleteManagedRoomOption(name: string) {
  return deleteManagedOption(name, "room");
}
export async function addManagedVendorOption(name: string) {
  return addManagedOption(name, "vendor");
}
export async function deleteManagedVendorOption(name: string) {
  return deleteManagedOption(name, "vendor");
}
export async function addManagedProjectOption(name: string) {
  return addManagedOption(name, "project");
}
export async function deleteManagedProjectOption(name: string) {
  return deleteManagedOption(name, "project");
}

export async function bulkDeleteManagedOptions(
  names: string[],
  optionType: OptionType
): Promise<{ success: boolean; message?: string; count?: number }> {
  // No admin user verification needed if delete is global by name/type

  const singularName = optionTypeToSingularName[optionType];
  if (!names || names.length === 0) {
    return {
      success: false,
      message: `No ${singularName.toLowerCase()}s selected for deletion.`,
    };
  }

  const { error, count } = await supabase
    .from("managed_options")
    .delete({ count: "exact" })
    .in("name", names)
    .eq("type", optionType);
  // .eq('user_id', ADMIN_USER_ID); // Removed for global deletion

  if (error) {
    console.error(
      `[bulkDeleteManagedOptions Supabase Error] Type: ${optionType}. Message: ${error.message}.`
    );
    return {
      success: false,
      message: `Database operation failed. Check Supabase Function logs. Action: bulkDeleteManagedOptions`,
    };
  }

  const deletedCount = count || 0;

  if (deletedCount > 0) {
    await logAuditAction("MANAGED_OPTIONS_BULK_DELETED", {
      target_table: "managed_options",
      details: { optionType: optionType, count: deletedCount, names },
      target_record_id: null,
      description: `Admin bulk deleted ${deletedCount} ${singularName.toLowerCase()} option(s): ${names.join(
        ", "
      )}.`,
    });
    const settingsPagePath = `/settings/${optionType.replace(/_/g, "-") + "s"}`;
    revalidatePath(settingsPagePath, "page");
    revalidatePath("/inventory/add", "layout");
    revalidatePath("/inventory/[id]/edit", "layout");
    return {
      success: true,
      message: `${deletedCount} ${singularName.toLowerCase()}(s) deleted successfully.`,
      count: deletedCount,
    };
  } else if (deletedCount === 0) {
    return {
      success: false,
      message: `No matching ${singularName.toLowerCase()}s found for deletion.`,
    };
  }
  return {
    success: false,
    message: `An issue occurred while deleting ${singularName.toLowerCase()}s (count: ${deletedCount}).`,
  };
}

export interface BulkImportResult {
  successCount: number;
  errorCount: number;
  errors: { rowNumber: number; message: string; rowData: string }[];
}

export async function bulkImportItems(
  csvFileContent: string
): Promise<BulkImportResult> {
  // Still verify admin user as items are inserted with ADMIN_USER_ID
  const adminUserCheck = await verifyAdminUserExists();
  if (!adminUserCheck.success) {
    return {
      successCount: 0,
      errorCount: 1,
      errors: [
        {
          rowNumber: 0,
          message:
            adminUserCheck.error ||
            "Admin user verification failed. Bulk import aborted. Action: bulkImportItems",
          rowData: "PRE-CHECK FAILED",
        },
      ],
    };
  }

  const lines = csvFileContent
    .split(/\r\n|\n/)
    .filter((line) => line.trim() !== "");
  if (lines.length <= 1) {
    return {
      successCount: 0,
      errorCount: 0,
      errors: [
        {
          rowNumber: 0,
          message: "CSV file is empty or contains only a header.",
          rowData: "",
        },
      ],
    };
  }

  const headerLine = lines[0];
  const expectedHeaders = [
    "name",
    "quantity",
    "purchasePrice",
    "salesPrice",
    "msrp",
    "sku",
    "category",
    "subcategory",
    "description",
    "vendor",
    "storageLocation",
    "binLocation",
    "room",
    "project",
    "purchaseDate",
    "productImageUrl",
    "receiptImageUrl",
    "productUrl",
    "status",
  ];
  const actualHeaders = headerLine
    .split(",")
    .map((h) => h.trim().toLowerCase());
  const headerMap: { [key: string]: number } = {};
  expectedHeaders.forEach((expectedHeader) => {
    const index = actualHeaders.indexOf(expectedHeader.toLowerCase());
    if (index !== -1) {
      headerMap[expectedHeader] = index;
    }
  });

  if (headerMap["name"] === undefined || headerMap["quantity"] === undefined) {
    return {
      successCount: 0,
      errorCount: lines.length - 1,
      errors: [
        {
          rowNumber: 1,
          message: "CSV must contain 'name' and 'quantity' columns.",
          rowData: headerLine,
        },
      ],
    };
  }

  const results: BulkImportResult = {
    successCount: 0,
    errorCount: 0,
    errors: [],
  };

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    const line = lines[i];
    const values = line.split(",").map((v) => v.trim());

    const getValue = (headerName: string): string | undefined => {
      const index = headerMap[headerName];
      return index !== undefined && index < values.length
        ? values[index]
        : undefined;
    };

    try {
      const name = getValue("name");
      if (!name) {
        results.errors.push({
          rowNumber,
          message: "Item name is required.",
          rowData: line,
        });
        results.errorCount++;
        continue;
      }

      const quantityStr = getValue("quantity");
      const quantity = parseInt(quantityStr || "", 10);
      if (isNaN(quantity) || quantity < 0) {
        results.errors.push({
          rowNumber,
          message: "Invalid quantity. Must be a non-negative number.",
          rowData: line,
        });
        results.errorCount++;
        continue;
      }

      const originalPriceStr = getValue("purchasePrice");
      const salesPriceStr = getValue("salesPrice");
      const msrpStr = getValue("msrp");
      const purchaseDateStr = getValue("purchaseDate");
      const statusStr = getValue("status")?.toLowerCase() as
        | ItemStatus
        | undefined;

      const itemInput: ItemInput = {
        name,
        quantity,
        originalPrice:
          originalPriceStr && originalPriceStr !== ""
            ? parseFloat(originalPriceStr)
            : undefined,
        salesPrice:
          salesPriceStr && salesPriceStr !== ""
            ? parseFloat(salesPriceStr)
            : undefined,
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
        purchaseDate:
          purchaseDateStr && purchaseDateStr !== ""
            ? new Date(purchaseDateStr).toISOString()
            : undefined,
        productImageUrl: getValue("productImageUrl") || undefined,
        receiptImageUrl: getValue("receiptImageUrl") || undefined,
        productUrl: getValue("productUrl") || undefined,
        status: ["in stock", "in use", "sold"].includes(statusStr || "")
          ? statusStr || "in stock"
          : "in stock",
      };

      if (
        itemInput.originalPrice !== undefined &&
        isNaN(itemInput.originalPrice)
      )
        itemInput.originalPrice = undefined;
      if (itemInput.salesPrice !== undefined && isNaN(itemInput.salesPrice))
        itemInput.salesPrice = undefined;
      if (itemInput.msrp !== undefined && isNaN(itemInput.msrp))
        itemInput.msrp = undefined;
      if (
        itemInput.purchaseDate &&
        (itemInput.purchaseDate.includes("Invalid Date") || !purchaseDateStr)
      ) {
        itemInput.purchaseDate = undefined;
      }

      const addResult = await createItem(itemInput);
      if ("error" in addResult) {
        results.errorCount++;
        results.errors.push({
          rowNumber,
          message: addResult.error,
          rowData: line,
        });
      } else {
        results.successCount++;
      }
    } catch (error: unknown) {
      results.errorCount++;
      results.errors.push({
        rowNumber,
        message: (error as Error).message || "Failed to add item.",
        rowData: line,
      });
    }
  }

  if (results.successCount > 0) {
    await logAuditAction("ITEMS_BULK_IMPORTED", {
      target_table: "items",
      details: {
        successCount: results.successCount,
        errorCount: results.errorCount,
      },
      target_record_id: null,
      description: `Admin bulk imported ${results.successCount} item(s) successfully, ${results.errorCount} failed.`,
    });
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
  }
  return results;
}
