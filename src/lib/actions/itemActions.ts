
"use server";

import type { Item, ItemInput, ExtractedItemData, ItemStatus } from "@/types/item";
import { revalidatePath } from "next/cache";
import { receiptDataExtraction, type ReceiptDataExtractionInput, type ReceiptDataExtractionOutput } from '@/ai/flows/receipt-data-extraction';

// Initial seed data for items
const initialItems: Item[] = [
  {
    id: "1",
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with USB-C charging.",
    quantity: 25,
    category: "Electronics",
    subcategory: "Peripherals",
    storageLocation: "Shelf A1",
    binLocation: "Bin 3",
    room: "Main Office",
    vendor: "TechSupply Co.",
    project: "Office Upgrade",
    originalPrice: 15.99,
    salesPrice: 29.99,
    msrp: 34.99,
    sku: "TEC-MOU-WRL-001",
    status: "in stock",
    productUrl: "https://example.com/products/wireless-mouse",
    barcodeData: "BARCODE-WM001",
    qrCodeData: "QR-WM001",
    receiptImageUrl: "https://placehold.co/300x400.png?text=Receipt+Mouse",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Mouse",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    soldDate: undefined,
    inUseDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "2",
    name: "Mechanical Keyboard",
    description: "RGB Mechanical Keyboard with blue switches.",
    quantity: 10,
    category: "Electronics",
    subcategory: "Peripherals",
    storageLocation: "Shelf A2",
    binLocation: "Bin 1",
    room: "Main Office",
    vendor: "Keychron",
    project: "Gaming Setup",
    originalPrice: 79.50,
    salesPrice: 120.00,
    msrp: 129.00,
    sku: "TEC-KEY-MEC-002",
    status: "sold",
    productUrl: undefined,
    barcodeData: "BARCODE-MK002",
    qrCodeData: "QR-MK002",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Keyboard",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    soldDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    inUseDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "3",
    name: "USB-C Hub",
    description: "7-in-1 USB-C Hub with HDMI, SD card reader.",
    quantity: 50,
    category: "Accessories",
    subcategory: "Computer Accessories",
    storageLocation: "Drawer B",
    binLocation: "Section 2",
    room: "Tech Closet",
    vendor: "Accessory King",
    project: "General Stock",
    originalPrice: 22.00,
    salesPrice: 35.00,
    msrp: 39.99,
    sku: "ACC-HUB-USBC-003",
    status: "in use",
    productUrl: "https://example.com/products/usb-c-hub",
    barcodeData: "BARCODE-UCH003",
    qrCodeData: "QR-UCH003",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Hub",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    soldDate: undefined,
    inUseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "4",
    name: "Standing Desk Converter",
    description: "Adjustable height standing desk converter.",
    quantity: 5,
    category: "Furniture",
    subcategory: "Desks",
    storageLocation: "Warehouse A",
    binLocation: "A-01",
    room: "Main Office",
    vendor: "StandUp Inc.",
    project: "Ergonomics Improvement",
    originalPrice: 120.00,
    salesPrice: 199.00,
    msrp: 229.00,
    sku: "FURN-DESK-STD-004",
    status: "in stock",
    productUrl: "https://example.com/products/standing-desk-converter",
    barcodeData: "BARCODE-SDC004",
    qrCodeData: "QR-SDC004",
    productImageUrl: "https://placehold.co/600x400.png?text=Standing+Desk",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "5",
    name: "LED Desk Lamp",
    description: "Modern LED desk lamp with brightness control.",
    quantity: 15,
    category: "Lighting",
    subcategory: "Desk Lamps",
    storageLocation: "Office Shelf",
    binLocation: "Shelf 1-A",
    room: "Main Office",
    vendor: "Lights R Us",
    project: "Office Upgrade",
    originalPrice: 25.00,
    salesPrice: 45.00,
    msrp: 49.99,
    sku: "LGT-LAMP-LED-005",
    status: "in use",
    productUrl: "https://example.com/products/led-desk-lamp",
    barcodeData: "BARCODE-LDL005",
    qrCodeData: "QR-LDL005",
    productImageUrl: "https://placehold.co/600x400.png?text=Desk+Lamp",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    inUseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const defaultManagedCategories = ['Electronics', 'Accessories', 'Office Supplies', 'Furniture', 'Appliances', 'Software', 'Miscellaneous', 'Lighting'];
const defaultManagedSubcategories = ['Peripherals', 'Computer Accessories', 'Cables', 'Lighting', 'Kitchen Appliances', 'Productivity Tools', 'Decor', 'Desks', 'Desk Lamps'];
const defaultManagedStorageLocations = ['Warehouse A', 'Warehouse B', 'Office Shelf', 'Storage Closet', 'Remote Site', 'Main Stockroom', 'Showroom', 'Kitchen Area', 'Drawer C', 'Pantry', 'Drawer B'];
const defaultManagedBinLocations = ['A-01', 'A-02', 'A-03', 'B-01', 'C-01', 'Shelf A1', 'Shelf A2', 'Shelf 1-A', 'Shelf 1-B', 'Shelf 1-C', 'Shelf 2-A', 'Drawer X', 'Pallet 5', 'Section 1', 'Section 2', 'Bin 1', 'Bin 3', 'Display A', 'Counter Top'];
const defaultManagedRooms = ['Main Office', 'Tech Closet', 'Server Room', 'Conference Room A', 'Break Room', 'Storage Unit 1'];
const defaultManagedVendors = ['TechSupply Co.', 'Keychron', 'Accessory King', 'StandUp Inc.', 'Lights R Us', 'Office Essentials', 'Generic Supplier'];
const defaultManagedProjects = ['Office Upgrade', 'Gaming Setup', 'General Stock', 'Ergonomics Improvement', 'New Office Setup', 'Client Project X', 'Internal R&D'];


// Initialize global stores if they don't exist
if (typeof globalThis._itemsStore === 'undefined') {
  globalThis._itemsStore = JSON.parse(JSON.stringify(initialItems));
}
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
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  const store: Item[] = globalThis._itemsStore || [];
  let filteredItems = [...store];

  if (filters) {
    if (filters.name && filters.name.trim() !== '') {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }
    if (filters.category && filters.category.trim() !== '') {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }
  }

  filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalFilteredItems = filteredItems.length;

  if (filters?.page && filters?.limit) {
    const page = filters.page;
    const limit = filters.limit;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(totalFilteredItems / limit);
    return { items: paginatedItems, totalPages, count: totalFilteredItems };
  } else {
    return { items: filteredItems, totalPages: 1, count: totalFilteredItems };
  }
}

export async function getItemById(id: string): Promise<Item | undefined> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const store: Item[] = globalThis._itemsStore || [];
  const item = store.find((item) => item.id === id);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function addItem(data: ItemInput): Promise<Item> {
  const store: Item[] = globalThis._itemsStore || [];
  globalThis._itemsStore = store; 

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const newItem: Item = {
    id,
    name: data.name,
    description: data.description,
    quantity: data.quantity,
    category: data.category,
    subcategory: data.subcategory,
    storageLocation: data.storageLocation,
    binLocation: data.binLocation,
    room: data.room,
    vendor: data.vendor,
    project: data.project,
    originalPrice: data.originalPrice,
    salesPrice: data.salesPrice,
    msrp: data.msrp,
    sku: data.sku,
    status: data.status || 'in stock',
    productUrl: data.productUrl,
    barcodeData: `BARCODE-${id.substring(0,8).toUpperCase()}`,
    qrCodeData: `QR-${id.toUpperCase()}`,
    receiptImageUrl: data.receiptImageUrl,
    productImageUrl: data.productImageUrl,
    purchaseDate: data.purchaseDate,
    soldDate: data.status === 'sold' ? (data.soldDate || now) : undefined,
    inUseDate: data.status === 'in use' ? (data.inUseDate || now) : undefined,
    createdAt: now,
    updatedAt: now,
  };
  globalThis._itemsStore.unshift(newItem);

  revalidatePath("/inventory", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/analytics", "layout");
  revalidatePath("/inventory/add", "layout");
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateItem(id: string, data: Partial<ItemInput>): Promise<Item | undefined> {
  const store: Item[] = globalThis._itemsStore || [];
  globalThis._itemsStore = store;
  const itemIndex = globalThis._itemsStore.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return undefined;
  }
  const now = new Date().toISOString();
  const currentItem = globalThis._itemsStore[itemIndex];
  
  const updatedItemDetails: Partial<Item> = { ...data };

  if (data.status && data.status !== currentItem.status) {
    updatedItemDetails.soldDate = data.status === 'sold' ? (data.soldDate || now) : undefined;
    updatedItemDetails.inUseDate = data.status === 'in use' ? (data.inUseDate || now) : undefined;
    if (data.status === 'in stock') {
        updatedItemDetails.soldDate = undefined;
        updatedItemDetails.inUseDate = undefined;
    }
  }


  globalThis._itemsStore[itemIndex] = {
    ...currentItem,
    ...updatedItemDetails,
    updatedAt: now,
  };

  revalidatePath("/inventory", "layout");
  revalidatePath(`/inventory/${id}`, "layout");
  revalidatePath(`/inventory/${id}/edit`, "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/analytics", "layout");
  return JSON.parse(JSON.stringify(globalThis._itemsStore[itemIndex]));
}

export async function deleteItem(id: string): Promise<boolean> {
  const store: Item[] = globalThis._itemsStore || [];
  const initialLength = store.length;
  globalThis._itemsStore = store.filter((item) => item.id !== id);

  if (globalThis._itemsStore.length < initialLength) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return true;
  }
  return false;
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

// --- Item Status Update Actions ---
export async function updateItemStatus(id: string, newStatus: ItemStatus): Promise<Item | undefined> {
  const store: Item[] = globalThis._itemsStore || [];
  globalThis._itemsStore = store;
  const itemIndex = globalThis._itemsStore.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return undefined;
  }
  const now = new Date().toISOString();
  const currentItem = { ...globalThis._itemsStore[itemIndex] }; 
  
  currentItem.status = newStatus;
  currentItem.updatedAt = now;

  if (newStatus === 'sold') {
    currentItem.soldDate = currentItem.soldDate || now; 
    currentItem.inUseDate = undefined; 
  } else if (newStatus === 'in use') {
    currentItem.inUseDate = currentItem.inUseDate || now; 
    currentItem.soldDate = undefined; 
  } else { // 'in stock'
    currentItem.soldDate = undefined;
    currentItem.inUseDate = undefined;
  }

  globalThis._itemsStore[itemIndex] = currentItem;

  revalidatePath("/inventory", "layout");
  revalidatePath(`/inventory/${id}`, "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/analytics", "layout");
  return JSON.parse(JSON.stringify(currentItem));
}

// --- Bulk Actions ---
export async function bulkDeleteItems(itemIds: string[]): Promise<{ success: boolean; message?: string }> {
  const store: Item[] = globalThis._itemsStore || [];
  const initialLength = store.length;
  globalThis._itemsStore = store.filter((item) => !itemIds.includes(item.id));
  const numDeleted = initialLength - globalThis._itemsStore.length;

  if (numDeleted > 0) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return { success: true, message: `${numDeleted} item(s) deleted successfully.` };
  }
  return { success: false, message: itemIds.length > 0 ? "No matching items found." : "No items selected." };
}

export async function bulkUpdateItemStatus(itemIds: string[], newStatus: ItemStatus): Promise<{ success: boolean; message?: string }> {
  const store: Item[] = globalThis._itemsStore || [];
  let updatedCount = 0;
  const now = new Date().toISOString();

  const newStore = store.map(item => {
    if (itemIds.includes(item.id)) {
      if (item.status !== newStatus) {
        const updatedItem = { ...item }; 
        updatedItem.status = newStatus;
        updatedItem.updatedAt = now;
        if (newStatus === 'sold') {
          updatedItem.soldDate = updatedItem.soldDate || now;
          updatedItem.inUseDate = undefined;
        } else if (newStatus === 'in use') {
          updatedItem.inUseDate = updatedItem.inUseDate || now;
          updatedItem.soldDate = undefined;
        } else { 
          updatedItem.soldDate = undefined;
          updatedItem.inUseDate = undefined;
        }
        updatedCount++;
        return updatedItem;
      }
    }
    return item;
  });

  if (updatedCount > 0) {
    globalThis._itemsStore = newStore; 
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    itemIds.forEach(id => revalidatePath(`/inventory/${id}`, "layout"));
    return { success: true, message: `${updatedCount} item(s) status updated to ${newStatus}.` };
  }
  return { success: false, message: itemIds.length > 0 ? "Items already have target status or not found." : "No items selected." };
}


export async function getUniqueCategories(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const store: Item[] = globalThis._itemsStore || [];
  const categories = Array.from(new Set(store.map(item => item.category).filter(Boolean as (value: any) => value is string))).sort();
  return categories;
}

// --- Managed Options Getters ---
type ManagedOptionStoreKey = 
  | '_managedCategoriesStore' 
  | '_managedSubcategoriesStore' 
  | '_managedStorageLocationsStore' 
  | '_managedBinLocationsStore' 
  | '_managedRoomsStore' 
  | '_managedVendorsStore' 
  | '_managedProjectsStore';

async function getManagedOptions(storeKey: ManagedOptionStoreKey): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 10));
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


// --- Managed Options Adders/Deleters ---
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
  revalidatePath("/settings/options", "layout");
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
    revalidatePath("/settings/options", "layout");
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
  
  // Validate essential headers
  if (headerMap["name"] === undefined || headerMap["quantity"] === undefined) {
      return { 
          successCount: 0, 
          errorCount: lines.length -1, // All data rows are errors
          errors: [{ rowNumber: 1, message: "CSV must contain 'name' and 'quantity' columns.", rowData: headerLine }] 
      };
  }

  const results: BulkImportResult = { successCount: 0, errorCount: 0, errors: [] };

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1; // CSV row number (1-indexed for user feedback)
    const line = lines[i];
    const values = line.split(',').map(v => v.trim()); // Basic CSV split

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
      
      const originalPriceStr = getValue("purchasePrice"); // Use purchasePrice from CSV
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
      
      // Post-parse validation/cleanup for potentially NaN values from parseFloat
      if (itemInput.originalPrice !== undefined && isNaN(itemInput.originalPrice)) itemInput.originalPrice = undefined;
      if (itemInput.salesPrice !== undefined && isNaN(itemInput.salesPrice)) itemInput.salesPrice = undefined;
      if (itemInput.msrp !== undefined && isNaN(itemInput.msrp)) itemInput.msrp = undefined;
      if (itemInput.purchaseDate && (itemInput.purchaseDate.includes("Invalid Date") || !purchaseDateStr)) {
        itemInput.purchaseDate = undefined; // Invalid date string
      }

      await addItem(itemInput);
      results.successCount++;
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
