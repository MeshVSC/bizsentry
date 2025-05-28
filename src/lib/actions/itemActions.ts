
"use server";

import type { Item, ItemInput } from "@/types/item";
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
    storageLocation: "Shelf A1",
    binLocation: "Bin 3",
    vendor: "TechSupply Co.",
    originalPrice: 15.99,
    salesPrice: 29.99,
    msrp: 34.99,
    project: "Office Upgrade",
    sold: false,
    barcodeData: "BARCODE-WM001",
    qrCodeData: "QR-WM001",
    receiptImageUrl: "https://placehold.co/300x400.png?text=Receipt+Mouse",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Mouse",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "2",
    name: "Mechanical Keyboard",
    description: "RGB Mechanical Keyboard with blue switches.",
    quantity: 10,
    category: "Electronics",
    storageLocation: "Shelf A2",
    binLocation: "Bin 1",
    vendor: "Keychron",
    originalPrice: 79.50,
    salesPrice: 120.00,
    msrp: 129.00,
    project: "Gaming Setup",
    sold: true,
    barcodeData: "BARCODE-MK002",
    qrCodeData: "QR-MK002",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Keyboard",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    soldDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "3",
    name: "USB-C Hub",
    description: "7-in-1 USB-C Hub with HDMI, SD card reader.",
    quantity: 50,
    category: "Accessories",
    storageLocation: "Drawer B",
    binLocation: "Section 2",
    vendor: "Accessory King",
    originalPrice: 22.00,
    salesPrice: 35.00,
    msrp: 39.99,
    project: "General Stock",
    sold: false,
    barcodeData: "BARCODE-UCH003",
    qrCodeData: "QR-UCH003",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Hub",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
   {
    id: "4",
    name: "Laptop Stand",
    description: "Adjustable aluminum laptop stand.",
    quantity: 15,
    category: "Accessories",
    storageLocation: "Office Shelf",
    binLocation: "Shelf 1-A",
    vendor: "StandUp Inc.",
    originalPrice: 18.00,
    salesPrice: 32.50,
    msrp: 35.00,
    project: "Ergonomics Improvement",
    sold: false,
    barcodeData: "BARCODE-LS004",
    qrCodeData: "QR-LS004",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Stand",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "5",
    name: "Desk Lamp",
    description: "LED desk lamp with adjustable brightness.",
    quantity: 8,
    category: "Office Supplies",
    storageLocation: "Warehouse A",
    binLocation: "A-01",
    vendor: "Lights R Us",
    originalPrice: 25.00,
    salesPrice: 45.00,
    msrp: 49.99,
    project: "New Office Setup",
    sold: false,
    barcodeData: "BARCODE-DL005",
    qrCodeData: "QR-DL005",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Lamp",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "6",
    name: "Monitor Arm",
    description: "Single monitor arm, gas spring.",
    quantity: 12,
    category: "Accessories",
    storageLocation: "Warehouse B",
    binLocation: "B-01",
    vendor: "Mounts Inc.",
    originalPrice: 40.00,
    salesPrice: 75.00,
    msrp: 79.99,
    project: "Ergonomics Upgrade",
    sold: false,
    barcodeData: "BARCODE-MA006",
    qrCodeData: "QR-MA006",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Arm",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "7",
    name: "Whiteboard Markers",
    description: "Pack of 12 assorted color whiteboard markers.",
    quantity: 100,
    category: "Office Supplies",
    storageLocation: "Storage Closet",
    binLocation: "Shelf 1-B",
    vendor: "Stationery World",
    originalPrice: 8.00,
    salesPrice: 15.00,
    msrp: 16.00,
    project: "General Stock",
    sold: false,
    barcodeData: "BARCODE-WM007",
    qrCodeData: "QR-WM007",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Markers",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "8",
    name: "Sticky Notes",
    description: "Pack of 12 pads, 3x3 inches, assorted colors.",
    quantity: 200,
    category: "Office Supplies",
    storageLocation: "Drawer C",
    binLocation: "Section 1",
    vendor: "Office Essentials",
    originalPrice: 5.00,
    salesPrice: 9.99,
    msrp: 10.99,
    project: "General Stock",
    sold: false,
    barcodeData: "BARCODE-SN008",
    qrCodeData: "QR-SN008",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Notes",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "9",
    name: "Ergonomic Chair",
    description: "High-back mesh office chair with lumbar support.",
    quantity: 5,
    category: "Furniture",
    storageLocation: "Showroom",
    binLocation: "Display A",
    vendor: "Comfort Seating",
    originalPrice: 150.00,
    salesPrice: 299.00,
    msrp: 320.00,
    project: "New Office Setup",
    sold: false,
    barcodeData: "BARCODE-EC009",
    qrCodeData: "QR-EC009",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Chair",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: "10",
    name: "Printer Paper",
    description: "Ream of 500 sheets, 8.5x11, 20lb.",
    quantity: 30,
    category: "Office Supplies",
    storageLocation: "Storage Closet",
    binLocation: "Shelf 2-A",
    vendor: "Paper R Us",
    originalPrice: 4.50,
    salesPrice: 8.00,
    msrp: 9.00,
    project: "General Stock",
    sold: false,
    barcodeData: "BARCODE-PP010",
    qrCodeData: "QR-PP010",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Paper",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "11",
    name: "Desk Organizer",
    description: "Mesh desk organizer with multiple compartments.",
    quantity: 20,
    category: "Office Supplies",
    storageLocation: "Office Shelf",
    binLocation: "Shelf 1-C",
    vendor: "Office Essentials",
    originalPrice: 12.00,
    salesPrice: 20.00,
    msrp: 22.50,
    project: "General Stock",
    sold: false,
    barcodeData: "BARCODE-DO011",
    qrCodeData: "QR-DO011",
    productImageUrl: "https://placehold.co/600x400.png?text=Desk+Organizer",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "12",
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker, waterproof.",
    quantity: 18,
    category: "Electronics",
    storageLocation: "Warehouse A",
    binLocation: "A-03",
    vendor: "SoundWave Inc.",
    originalPrice: 30.00,
    salesPrice: 55.00,
    msrp: 59.99,
    project: "Promotional Giveaway",
    sold: false,
    barcodeData: "BARCODE-BS012",
    qrCodeData: "QR-BS012",
    productImageUrl: "https://placehold.co/600x400.png?text=Bluetooth+Speaker",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "13",
    name: "Coffee Maker",
    description: "12-cup programmable coffee maker.",
    quantity: 7,
    category: "Appliances",
    storageLocation: "Kitchen Area",
    binLocation: "Counter Top",
    vendor: "BrewMaster",
    originalPrice: 45.00,
    salesPrice: 70.00,
    msrp: 75.00,
    project: "Office Amenities",
    sold: false,
    barcodeData: "BARCODE-CM013",
    qrCodeData: "QR-CM013",
    productImageUrl: "https://placehold.co/600x400.png?text=Coffee+Maker",
    purchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    soldDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  }
];

// Default options for managed dropdowns
const defaultManagedCategories = ['Electronics', 'Accessories', 'Office Supplies', 'Furniture', 'Appliances', 'Software', 'Miscellaneous'];
const defaultManagedStorageLocations = ['Warehouse A', 'Warehouse B', 'Office Shelf', 'Storage Closet', 'Remote Site', 'Main Stockroom', 'Showroom', 'Kitchen Area', 'Drawer C', 'Pantry'];
const defaultManagedBinLocations = ['A-01', 'A-02', 'A-03', 'B-01', 'C-01', 'Shelf A1', 'Shelf A2', 'Shelf 1-A', 'Shelf 1-B', 'Shelf 1-C', 'Shelf 2-A', 'Drawer X', 'Pallet 5', 'Section 1', 'Section 2', 'Bin 1', 'Bin 3', 'Display A', 'Counter Top'];

// Initialize global stores if they don't exist
if (typeof globalThis._itemsStore === 'undefined') {
  globalThis._itemsStore = JSON.parse(JSON.stringify(initialItems));
}
if (typeof globalThis._managedCategoriesStore === 'undefined') {
  globalThis._managedCategoriesStore = [...defaultManagedCategories];
}
if (typeof globalThis._managedStorageLocationsStore === 'undefined') {
  globalThis._managedStorageLocationsStore = [...defaultManagedStorageLocations];
}
if (typeof globalThis._managedBinLocationsStore === 'undefined') {
  globalThis._managedBinLocationsStore = [...defaultManagedBinLocations];
}

// Interface for filters
export interface ItemFilters {
  name?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// Item CRUD Actions
export async function getItems(filters?: ItemFilters): Promise<{ items: Item[]; totalPages: number; count: number }> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const store = globalThis._itemsStore || [];
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
    // If no pagination, return all filtered items
    return { items: filteredItems, totalPages: 1, count: totalFilteredItems };
  }
}

export async function getItemById(id: string): Promise<Item | undefined> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const store = globalThis._itemsStore || [];
  const item = store.find((item) => item.id === id);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function addItem(data: ItemInput): Promise<Item> {
  const store = globalThis._itemsStore || [];
  globalThis._itemsStore = store;

  const id = crypto.randomUUID();
  const newItem: Item = {
    id,
    name: data.name,
    description: data.description,
    quantity: data.quantity,
    category: data.category,
    storageLocation: data.storageLocation,
    binLocation: data.binLocation,
    vendor: data.vendor,
    originalPrice: data.originalPrice,
    salesPrice: data.salesPrice,
    msrp: data.msrp,
    project: data.project,
    receiptImageUrl: data.receiptImageUrl,
    productImageUrl: data.productImageUrl,
    purchaseDate: data.purchaseDate,
    soldDate: data.soldDate,
    sold: false, // New items are not sold by default
    barcodeData: `BARCODE-${id.substring(0,8).toUpperCase()}`,
    qrCodeData: `QR-${id.toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  globalThis._itemsStore.unshift(newItem);

  revalidatePath("/inventory", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/analytics", "layout");
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateItem(id: string, data: Partial<ItemInput>): Promise<Item | undefined> {
  const store = globalThis._itemsStore || [];
  globalThis._itemsStore = store;
  const itemIndex = store.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return undefined;
  }

  const updatedItemDetails: Partial<Item> = { ...data };

  globalThis._itemsStore[itemIndex] = {
    ...globalThis._itemsStore[itemIndex],
    ...updatedItemDetails,
    updatedAt: new Date().toISOString(),
  };

  revalidatePath("/inventory", "layout");
  revalidatePath(`/inventory/${id}`, "layout");
  revalidatePath(`/inventory/${id}/edit`, "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/analytics", "layout");
  return JSON.parse(JSON.stringify(globalThis._itemsStore[itemIndex]));
}

export async function deleteItem(id: string): Promise<boolean> {
  const store = globalThis._itemsStore || [];
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

// Actions for receipt processing
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

// Actions for toggling sold status and bulk operations
export async function toggleItemSoldStatus(id: string): Promise<Item | undefined> {
  const store = globalThis._itemsStore || [];
  globalThis._itemsStore = store;
  const itemIndex = store.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return undefined;
  }
  const currentItem = globalThis._itemsStore[itemIndex];
  currentItem.sold = !currentItem.sold;
  // If item is marked as sold, set soldDate. If marked as not sold, clear soldDate.
  currentItem.soldDate = currentItem.sold ? new Date().toISOString() : undefined;
  currentItem.updatedAt = new Date().toISOString();

  revalidatePath("/inventory", "layout");
  revalidatePath(`/inventory/${id}`, "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/analytics", "layout");
  return JSON.parse(JSON.stringify(currentItem));
}

export async function bulkDeleteItems(itemIds: string[]): Promise<{ success: boolean; message?: string }> {
  const store = globalThis._itemsStore || [];
  globalThis._itemsStore = store;

  const initialLength = globalThis._itemsStore.length;
  globalThis._itemsStore = globalThis._itemsStore.filter((item) => !itemIds.includes(item.id));

  const numDeleted = initialLength - globalThis._itemsStore.length;

  if (numDeleted > 0) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    return { success: true, message: `${numDeleted} item(s) deleted successfully.` };
  }
  if (itemIds.length > 0 && numDeleted === 0) {
    return { success: false, message: "No matching items found to delete." };
  }
  return { success: false, message: "No items were selected for deletion." };
}

export async function bulkUpdateSoldStatus(itemIds: string[], sold: boolean): Promise<{ success: boolean; message?: string }> {
  const store = globalThis._itemsStore || [];
  globalThis._itemsStore = store;

  let updatedCount = 0;
  const currentDateISO = new Date().toISOString();
  globalThis._itemsStore = globalThis._itemsStore.map(item => {
    if (itemIds.includes(item.id)) {
      if (item.sold !== sold) {
        item.sold = sold;
        item.soldDate = sold ? currentDateISO : undefined; // Update soldDate based on new status
        item.updatedAt = currentDateISO;
        updatedCount++;
      }
    }
    return item;
  });

  if (updatedCount > 0) {
    revalidatePath("/inventory", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/analytics", "layout");
    itemIds.forEach(id => {
        revalidatePath(`/inventory/${id}`, "layout");
    });
    return { success: true, message: `${updatedCount} item(s) status updated.` };
  }
  if (itemIds.length > 0 && updatedCount === 0) {
    return { success: false, message: "Items already have the target status or not found." };
  }
  return { success: false, message: "No items were selected for status update." };
}

// Actions for managed dropdown options

// Categories (used for Inventory Filters on inventory list page - derived from actual items)
export async function getUniqueCategories(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const store = globalThis._itemsStore || [];
  const categories = Array.from(new Set(store.map(item => item.category).filter(Boolean as (value: any) => value is string))).sort();
  return categories;
}

// Managed Category Options (for ItemForm dropdown)
export async function getManagedCategoryOptions(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...(globalThis._managedCategoriesStore || [])].sort();
}

export async function addManagedCategoryOption(name: string): Promise<{ success: boolean; message?: string; options?: string[] }> {
  if (!name || name.trim() === "") {
    return { success: false, message: "Category name cannot be empty." };
  }
  const store = globalThis._managedCategoriesStore || [];
  if (store.map(s => s.toLowerCase()).includes(name.toLowerCase())) {
    return { success: false, message: `Category "${name}" already exists.` };
  }
  store.push(name);
  globalThis._managedCategoriesStore = store;
  revalidatePath("/settings/options", "layout");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return { success: true, message: `Category "${name}" added.`, options: [...store].sort() };
}

export async function deleteManagedCategoryOption(name: string): Promise<{ success: boolean; message?: string; options?: string[] }> {
  const store = globalThis._managedCategoriesStore || [];
  const initialLength = store.length;
  globalThis._managedCategoriesStore = store.filter(cat => cat !== name);
  if (globalThis._managedCategoriesStore.length < initialLength) {
    revalidatePath("/settings/options", "layout");
    revalidatePath("/inventory/add", "layout");
    revalidatePath("/inventory/[id]/edit", "layout");
    return { success: true, message: `Category "${name}" deleted.`, options: [...globalThis._managedCategoriesStore].sort() };
  }
  return { success: false, message: `Category "${name}" not found.` };
}

// Managed Storage Location Options (for ItemForm dropdown)
export async function getManagedStorageLocationOptions(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...(globalThis._managedStorageLocationsStore || [])].sort();
}

export async function addManagedStorageLocationOption(name: string): Promise<{ success: boolean; message?: string; options?: string[] }> {
  if (!name || name.trim() === "") {
    return { success: false, message: "Storage location name cannot be empty." };
  }
  const store = globalThis._managedStorageLocationsStore || [];
  if (store.map(s => s.toLowerCase()).includes(name.toLowerCase())) {
    return { success: false, message: `Storage location "${name}" already exists.` };
  }
  store.push(name);
  globalThis._managedStorageLocationsStore = store;
  revalidatePath("/settings/options", "layout");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return { success: true, message: `Storage location "${name}" added.`, options: [...store].sort() };
}

export async function deleteManagedStorageLocationOption(name: string): Promise<{ success: boolean; message?: string; options?: string[] }> {
  const store = globalThis._managedStorageLocationsStore || [];
  const initialLength = store.length;
  globalThis._managedStorageLocationsStore = store.filter(loc => loc !== name);
  if (globalThis._managedStorageLocationsStore.length < initialLength) {
    revalidatePath("/settings/options", "layout");
    revalidatePath("/inventory/add", "layout");
    revalidatePath("/inventory/[id]/edit", "layout");
    return { success: true, message: `Storage location "${name}" deleted.`, options: [...globalThis._managedStorageLocationsStore].sort() };
  }
  return { success: false, message: `Storage location "${name}" not found.` };
}

// Managed Bin Location Options (for ItemForm dropdown)
export async function getManagedBinLocationOptions(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [...(globalThis._managedBinLocationsStore || [])].sort();
}

export async function addManagedBinLocationOption(name: string): Promise<{ success: boolean; message?: string; options?: string[] }> {
  if (!name || name.trim() === "") {
    return { success: false, message: "Bin location name cannot be empty." };
  }
  const store = globalThis._managedBinLocationsStore || [];
  if (store.map(s => s.toLowerCase()).includes(name.toLowerCase())) {
    return { success: false, message: `Bin location "${name}" already exists.` };
  }
  store.push(name);
  globalThis._managedBinLocationsStore = store;
  revalidatePath("/settings/options", "layout");
  revalidatePath("/inventory/add", "layout");
  revalidatePath("/inventory/[id]/edit", "layout");
  return { success: true, message: `Bin location "${name}" added.`, options: [...store].sort() };
}

export async function deleteManagedBinLocationOption(name: string): Promise<{ success: boolean; message?: string; options?: string[] }> {
  const store = globalThis._managedBinLocationsStore || [];
  const initialLength = store.length;
  globalThis._managedBinLocationsStore = store.filter(loc => loc !== name);
  if (globalThis._managedBinLocationsStore.length < initialLength) {
    revalidatePath("/settings/options", "layout");
    revalidatePath("/inventory/add", "layout");
    revalidatePath("/inventory/[id]/edit", "layout");
    return { success: true, message: `Bin location "${name}" deleted.`, options: [...globalThis._managedBinLocationsStore].sort() };
  }
  return { success: false, message: `Bin location "${name}" not found.` };
}
