
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

// ItemInput defines the expected shape of data from ItemForm after Zod validation & coercion.
export type ItemInput = {
  name: string;
  description?: string;
  quantity: number; // Zod ensures this is a number
  category?: string;
  storageLocation?: string;
  binLocation?: string;
  vendor?: string;
  originalPrice?: number; // Zod ensures this is number | undefined
  salesPrice?: number;    // Zod ensures this is number | undefined
  project?: string;
  receiptImageUrl?: string; // Zod ensures this is string | undefined (if url() passes or empty)
};

// For AI extraction mapping
export interface ExtractedItemData {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
}
