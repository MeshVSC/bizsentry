
export interface Item {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  category?: string;
  storageLocation?: string;
  binLocation?: string;
  vendor?: string;
  originalPrice?: number; // Purchase price for the business
  salesPrice?: number;    // Price at which item is sold
  project?: string;
  sold: boolean;          // True if this stock of item is sold out / not available
  barcodeData?: string;   // Data to be encoded in barcode (e.g., item ID)
  qrCodeData?: string;    // Data to be encoded in QR code (e.g., item URL or ID)
  receiptImageUrl?: string; // URL of the uploaded receipt image
  createdAt: string; // Store as ISO string for easier serialization
  updatedAt: string; // Store as ISO string
}

export type ItemInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'sold' | 'barcodeData' | 'qrCodeData'> & {
  quantity: number | string; // Allow string for form input
  originalPrice?: number | string;
  salesPrice?: number | string;
};

// For AI extraction mapping
export interface ExtractedItemData {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
}
