
"use server";

import type { Item, ItemInput } from "@/types/item";
import { revalidatePath } from "next/cache";
import { receiptDataExtraction, type ReceiptDataExtractionInput, type ReceiptDataExtractionOutput } from '@/ai/flows/receipt-data-extraction';

// Initial seed data for the in-memory store
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
];

// Ensure items array persists across HMR updates in dev
// Use globalThis for wider compatibility (Node.js global and browser window)
// but since this is a server action, globalThis refers to Node.js global.
if (!globalThis._itemsStore) {
  // Deep copy initialItems to prevent modification of the original constant
  globalThis._itemsStore = JSON.parse(JSON.stringify(initialItems));
}
let items: Item[] = globalThis._itemsStore;


export async function getItems(): Promise<Item[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(items)); // Deep copy to prevent direct mutation issues
}

export async function getItemById(id: string): Promise<Item | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const item = items.find((item) => item.id === id);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function addItem(data: ItemInput): Promise<Item> {
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
    sold: false, // New items are not sold by default
    barcodeData: `BARCODE-${id.substring(0,8).toUpperCase()}`,
    qrCodeData: `QR-${id.toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateItem(id: string, data: Partial<ItemInput>): Promise<Item | undefined> {
  const itemIndex = items.findIndex((item) => item.id === id);
  if (itemIndex === -1) {
    return undefined;
  }

  const updatedItemDetails: Partial<Item> = { ...data };
  // If quantity is updated to 0, should it also be marked as sold?
  // Current logic keeps 'sold' status separate unless explicitly toggled.
  // if (data.quantity !== undefined && data.quantity <= 0 && items[itemIndex].sold === false) {
  //   updatedItemDetails.sold = true; // Example: auto-mark as sold if quantity hits 0
  // }


  items[itemIndex] = {
    ...items[itemIndex],
    ...updatedItemDetails,
    updatedAt: new Date().toISOString(),
  };
  
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  revalidatePath(`/inventory/${id}/edit`);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return JSON.parse(JSON.stringify(items[itemIndex]));
}

export async function deleteItem(id: string): Promise<boolean> {
  const initialLength = items.length;
  items = items.filter((item) => item.id !== id);
  if (items.length < initialLength) {
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
  const itemIndex = items.findIndex((item) => item.id === id);
  if (itemIndex === -1) {
    return undefined;
  }
  items[itemIndex].sold = !items[itemIndex].sold;
  items[itemIndex].updatedAt = new Date().toISOString();
  
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return JSON.parse(JSON.stringify(items[itemIndex]));
}
