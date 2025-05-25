
"use server";

import type { Item, ItemInput } from "@/types/item";
import { revalidatePath } from "next/cache";
import { receiptDataExtraction, type ReceiptDataExtractionInput, type ReceiptDataExtractionOutput } from '@/ai/flows/receipt-data-extraction';

// Initial seed data
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
    project: "Office Upgrade",
    sold: false,
    barcodeData: "BARCODE-WM001",
    qrCodeData: "QR-WM001",
    receiptImageUrl: "https://placehold.co/300x400.png?text=Receipt+Mouse",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Mouse",
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
    project: "Gaming Setup",
    sold: true,
    barcodeData: "BARCODE-MK002",
    qrCodeData: "QR-MK002",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Keyboard",
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
    project: "General Stock",
    sold: false,
    barcodeData: "BARCODE-UCH003",
    qrCodeData: "QR-UCH003",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Hub",
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
    project: "Ergonomics Improvement",
    sold: false,
    barcodeData: "BARCODE-LS004",
    qrCodeData: "QR-LS004",
    productImageUrl: "https://placehold.co/600x400.png?text=Product+Stand",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

// Initialize global store if it doesn't exist
if (typeof globalThis._itemsStore === 'undefined') {
  globalThis._itemsStore = JSON.parse(JSON.stringify(initialItems));
}

// Interface for filters
export interface ItemFilters {
  name?: string;
  category?: string;
}

export async function getItems(filters?: ItemFilters): Promise<Item[]> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async delay
  let store = globalThis._itemsStore || [];
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
  return JSON.parse(JSON.stringify(filteredItems));
}

export async function getUniqueCategories(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const store = globalThis._itemsStore || [];
  const categories = Array.from(new Set(store.map(item => item.category).filter(Boolean as (value: any) => value is string))).sort();
  return categories;
}


export async function getItemById(id: string): Promise<Item | undefined> {
  await new Promise(resolve => setTimeout(resolve, 50)); 
  const store = globalThis._itemsStore || [];
  const item = store.find((item) => item.id === id);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function addItem(data: ItemInput): Promise<Item> {
  if (typeof globalThis._itemsStore === 'undefined') {
    globalThis._itemsStore = []; 
  }
  const store = globalThis._itemsStore;

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
    project: data.project,
    receiptImageUrl: data.receiptImageUrl,
    productImageUrl: data.productImageUrl,
    sold: false,
    barcodeData: `BARCODE-${id.substring(0,8).toUpperCase()}`,
    qrCodeData: `QR-${id.toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.push(newItem); 

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  // No longer redirecting to item detail page to avoid 404 on Vercel with in-memory store
  // The form itself handles redirection now.
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateItem(id: string, data: Partial<ItemInput>): Promise<Item | undefined> {
  if (typeof globalThis._itemsStore === 'undefined' || !globalThis._itemsStore) {
    return undefined;
  }
  const store = globalThis._itemsStore;
  const itemIndex = store.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return undefined;
  }

  const updatedItemDetails: Partial<Item> = { ...data };

  store[itemIndex] = {
    ...store[itemIndex],
    ...updatedItemDetails,
    updatedAt: new Date().toISOString(),
  };
  
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  revalidatePath(`/inventory/${id}/edit`);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return JSON.parse(JSON.stringify(store[itemIndex]));
}

export async function deleteItem(id: string): Promise<boolean> {
  let store = globalThis._itemsStore;
  if (typeof store === 'undefined') {
     store = []; 
     globalThis._itemsStore = store;
  }
  const initialLength = store.length;
  
  globalThis._itemsStore = store.filter((item) => item.id !== id); 

  if (globalThis._itemsStore.length < initialLength) {
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");
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

export async function toggleItemSoldStatus(id: string): Promise<Item | undefined> {
  let store = globalThis._itemsStore;
  if (typeof store === 'undefined' || !store) {
    return undefined;
  }
  const itemIndex = store.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return undefined;
  }
  store[itemIndex].sold = !store[itemIndex].sold;
  store[itemIndex].updatedAt = new Date().toISOString();
  
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return JSON.parse(JSON.stringify(store[itemIndex]));
}

export async function bulkDeleteItems(itemIds: string[]): Promise<{ success: boolean; message?: string }> {
  let store = globalThis._itemsStore;
  if (typeof store === 'undefined') {
     store = [];
     globalThis._itemsStore = store;
  }
  const initialLength = store.length;
  globalThis._itemsStore = store.filter((item) => !itemIds.includes(item.id));
  
  const numDeleted = initialLength - globalThis._itemsStore.length;

  if (numDeleted > 0) {
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");
    return { success: true, message: `${numDeleted} item(s) deleted successfully.` };
  }
  if (itemIds.length > 0 && numDeleted === 0) {
    return { success: false, message: "No matching items found to delete." };
  }
  return { success: false, message: "No items were selected for deletion." };
}

export async function bulkUpdateSoldStatus(itemIds: string[], sold: boolean): Promise<{ success: boolean; message?: string }> {
  let store = globalThis._itemsStore;
  if (typeof store === 'undefined' || !store) {
    return { success: false, message: "Inventory store not available." };
  }
  let updatedCount = 0;
  globalThis._itemsStore = store.map(item => {
    if (itemIds.includes(item.id)) {
      if (item.sold !== sold) { 
        item.sold = sold;
        item.updatedAt = new Date().toISOString();
        updatedCount++;
      }
    }
    return item;
  });

  if (updatedCount > 0) {
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");
    itemIds.forEach(id => {
        revalidatePath(`/inventory/${id}`);
    });
    return { success: true, message: `${updatedCount} item(s) status updated.` };
  }
  if (itemIds.length > 0 && updatedCount === 0) {
    return { success: false, message: "Items already have the target status or not found." };
  }
  return { success: false, message: "No items were selected for status update." };
}
