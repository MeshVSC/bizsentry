
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

// Initialize global store if it doesn't exist
if (typeof globalThis._itemsStore === 'undefined') {
  // console.log("Initializing _itemsStore for the first time in itemActions.ts");
  globalThis._itemsStore = JSON.parse(JSON.stringify(initialItems));
}

export async function getItems(): Promise<Item[]> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Shorter delay
  const store = globalThis._itemsStore || [];
  // console.log('getItems called. Store size:', store.length);
  return JSON.parse(JSON.stringify(store));
}

export async function getItemById(id: string): Promise<Item | undefined> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Shorter delay
  const store = globalThis._itemsStore || [];
  const item = store.find((item) => item.id === id);
  // console.log('getItemById called for:', id, 'Found:', !!item);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function addItem(data: ItemInput): Promise<Item> {
  if (typeof globalThis._itemsStore === 'undefined') {
    globalThis._itemsStore = []; // Should be initialized already, but defensive
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
    sold: false,
    barcodeData: `BARCODE-${id.substring(0,8).toUpperCase()}`,
    qrCodeData: `QR-${id.toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.push(newItem); // This mutates the array referenced by globalThis._itemsStore
  // console.log('Item added to store:', newItem.name, 'New store size:', store.length);

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  // console.log('Revalidation paths called for /inventory, /dashboard, /analytics after adding', newItem.name);
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateItem(id: string, data: Partial<ItemInput>): Promise<Item | undefined> {
  if (typeof globalThis._itemsStore === 'undefined' || !globalThis._itemsStore) {
    // console.error('Attempted to update item, but _itemsStore is not initialized.');
    return undefined;
  }
  const store = globalThis._itemsStore;
  const itemIndex = store.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    // console.log('Update failed: Item not found with id:', id);
    return undefined;
  }

  const updatedItemDetails: Partial<Item> = { ...data };

  store[itemIndex] = {
    ...store[itemIndex],
    ...updatedItemDetails,
    updatedAt: new Date().toISOString(),
  };
  // console.log('Item updated in store:', store[itemIndex].name);
  
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  revalidatePath(`/inventory/${id}/edit`);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  // console.log('Revalidation paths called for /inventory, /dashboard, /analytics after updating', store[itemIndex].name);
  return JSON.parse(JSON.stringify(store[itemIndex]));
}

export async function deleteItem(id: string): Promise<boolean> {
  if (typeof globalThis._itemsStore === 'undefined') {
     globalThis._itemsStore = []; // Ensure it's an array if somehow undefined
  }
  const store = globalThis._itemsStore;
  const initialLength = store.length;
  
  globalThis._itemsStore = store.filter((item) => item.id !== id); // Reassign the global store
  // console.log('Item deleted from store. ID:', id, 'New store size:', globalThis._itemsStore.length);

  if (globalThis._itemsStore.length < initialLength) {
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");
    // console.log('Revalidation paths called for /inventory, /dashboard, /analytics after deleting ID:', id);
    return true;
  }
  return false;
}

export async function processReceiptImage(receiptImage: string): Promise<ReceiptDataExtractionOutput | { error: string }> {
  try {
    const input: ReceiptDataExtractionInput = { receiptImage };
    const extractedData = await receiptDataExtraction(input);
    if (!extractedData.items) {
      return { ...extractedData, items: [] }; // Ensure items array exists
    }
    return extractedData;
  } catch (error) {
    console.error("Error processing receipt:", error);
    return { error: "Failed to extract data from receipt. Please try again or enter manually." };
  }
}

export async function toggleItemSoldStatus(id: string): Promise<Item | undefined> {
  if (typeof globalThis._itemsStore === 'undefined' || !globalThis._itemsStore) {
    return undefined;
  }
  const store = globalThis._itemsStore;
  const itemIndex = store.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return undefined;
  }
  store[itemIndex].sold = !store[itemIndex].sold;
  store[itemIndex].updatedAt = new Date().toISOString();
  // console.log('Item status toggled:', store[itemIndex].name, 'New status sold:', store[itemIndex].sold);
  
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  // console.log('Revalidation paths called after toggling status for', store[itemIndex].name);
  return JSON.parse(JSON.stringify(store[itemIndex]));
}

    