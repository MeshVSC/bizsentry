
export type ItemStatus = 'in stock' | 'in use' | 'sold';

export interface Item {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  category?: string;
  subcategory?: string;
  storageLocation?: string;
  binLocation?: string;
  room?: string;
  vendor?: string;
  project?: string;
  originalPrice?: number; 
  salesPrice?: number;    
  msrp?: number; 
  sku?: string; 
  status: ItemStatus; 
  barcodeData?: string;
  qrCodeData?: string;
  receiptImageUrl?: string;
  productImageUrl?: string;
  productUrl?: string;
  purchaseDate?: string; 
  soldDate?: string; 
  inUseDate?: string; 
  createdAt: string; 
  updatedAt: string; 
  user_id?: string | null; // Keep for compatibility if db column exists and is nullable
}

export type ItemInput = {
  name: string;
  description?: string;
  quantity: number;
  category?: string;
  subcategory?: string;
  storageLocation?: string;
  binLocation?: string;
  room?: string;
  vendor?: string;
  project?: string;
  originalPrice?: number;
  salesPrice?: number;
  msrp?: number;
  sku?: string;
  status: ItemStatus;
  receiptImageUrl?: string;
  productImageUrl?: string;
  productUrl?: string;
  purchaseDate?: string;
  soldDate?: string;
  inUseDate?: string;
  // invokedByUserId is removed
};

export interface ExtractedItemData {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
  sku?: string;
}
