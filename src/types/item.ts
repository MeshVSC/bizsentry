
export type ItemStatus = 'in stock' | 'in use' | 'sold';

export interface Item {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  category?: string;
  subcategory?: string; // New field
  storageLocation?: string;
  binLocation?: string;
  room?: string; // New field
  vendor?: string;
  project?: string; // Will be a dropdown
  originalPrice?: number; // Purchase price for the business
  salesPrice?: number;    // Price at which item is sold
  msrp?: number; // Manufacturer's Suggested Retail Price
  sku?: string; // Stock Keeping Unit
  status: ItemStatus; // Updated from sold: boolean
  barcodeData?: string;
  qrCodeData?: string;
  receiptImageUrl?: string;
  productImageUrl?: string;
  productUrl?: string;
  purchaseDate?: string; // ISO string for date
  soldDate?: string; // ISO string for date, set when status becomes 'sold'
  inUseDate?: string; // New: ISO string for date when status becomes 'in use'
  createdAt: string; // Store as ISO string for easier serialization
  updatedAt: string; // Store as ISO string
}

export type ItemInput = {
  name: string;
  description?: string;
  quantity: number;
  category?: string;
  subcategory?: string; // New field
  storageLocation?: string;
  binLocation?: string;
  room?: string; // New field
  vendor?: string;
  project?: string; // New field
  originalPrice?: number;
  salesPrice?: number;
  msrp?: number;
  sku?: string;
  status: ItemStatus; // New field for form
  receiptImageUrl?: string;
  productImageUrl?: string;
  productUrl?: string;
  purchaseDate?: string;
  soldDate?: string; // Potentially set by form or action
  inUseDate?: string; // Potentially set by form or action
  invokedByUserId?: string; // To help server actions identify the calling user if direct session reading is problematic
};

export interface ExtractedItemData {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
  sku?: string;
}
