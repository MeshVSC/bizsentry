
"use client";

import type { Item, ItemInput, ExtractedItemData, ItemStatus } from "@/types/item";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { processReceiptImage } from "@/lib/actions/itemActions";
import FileUploadInput from "@/components/shared/FileUploadInput";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { SubmitButton } from "@/components/shared/SubmitButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NextImage from "next/image";
import { DatePicker } from "@/components/shared/DatePicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from '@/contexts/AuthContext'; 

const itemStatuses: ItemStatus[] = ['in stock', 'in use', 'sold'];

const itemFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  description: z.string().max(500).optional().default(""),
  quantity: z.coerce.number().min(0, { message: "Quantity must be non-negative." }),
  category: z.string().max(50).optional().default(""),
  subcategory: z.string().max(50).optional().default(""),
  storageLocation: z.string().max(100).optional().default(""),
  binLocation: z.string().max(50).optional().default(""),
  room: z.string().max(100).optional().default(""),
  vendor: z.string().max(100).optional().default(""),
  project: z.string().max(100).optional().default(""),
  originalPrice: z.coerce.number().min(0).optional(),
  salesPrice: z.coerce.number().min(0).optional(),
  msrp: z.coerce.number().min(0).optional(),
  sku: z.string().max(50).optional().default(""),
  status: z.enum(itemStatuses, { required_error: "Status is required."}).default("in stock"),
  receiptImageUrl: z.string().optional().or(z.literal("")).default(""),
  productImageUrl: z.string().optional().default(""),
  productUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")).default(""),
  purchaseDate: z.date().optional(),
  soldDate: z.date().optional(),
  inUseDate: z.date().optional(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  item?: Item;
  onSubmitAction: (data: ItemInput) => Promise<Item | { error: string } | undefined>;
  isEditing?: boolean;
  availableCategories: string[];
  availableSubcategories: string[];
  availableStorageLocations: string[];
  availableBinLocations: string[];
  availableRooms: string[];
  availableVendors: string[];
  availableProjects: string[];
}

const MAX_IMAGE_SIZE_MB = 2;

export default function ItemForm({
  item,
  onSubmitAction,
  isEditing = false,
  availableCategories,
  availableSubcategories,
  availableStorageLocations,
  availableBinLocations,
  availableRooms,
  availableVendors,
  availableProjects,
}: ItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isReceiptProcessing, setIsReceiptProcessing] = useState(false);
  const [isProductImageProcessing, setIsProductImageProcessing] = useState(false);
  const { currentUser } = useAuth(); // Will be null if auth is paused


  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      quantity: item?.quantity || 0,
      category: item?.category || "",
      subcategory: item?.subcategory || "",
      storageLocation: item?.storageLocation || "",
      binLocation: item?.binLocation || "",
      room: item?.room || "",
      vendor: item?.vendor || "",
      project: item?.project || "",
      originalPrice: item?.originalPrice ?? '', 
      salesPrice: item?.salesPrice ?? '',   
      msrp: item?.msrp ?? '',               
      sku: item?.sku || "",
      status: item?.status || "in stock",
      receiptImageUrl: item?.receiptImageUrl || "",
      productImageUrl: item?.productImageUrl || "",
      productUrl: item?.productUrl || "",
      purchaseDate: item?.purchaseDate ? new Date(item.purchaseDate) : undefined,
      soldDate: item?.soldDate ? new Date(item.soldDate) : undefined,
      inUseDate: item?.inUseDate ? new Date(item.inUseDate) : undefined,
    },
  });

  const handleReceiptUpload = async (file: File) => {
    setIsReceiptProcessing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const result = await processReceiptImage(base64data);
        if ('error' in result || !result.items || result.items.length === 0) {
          toast({ title: "Receipt Processing Failed", description: (result as any).error || "Could not extract data from receipt.", variant: "destructive" });
        } else {
          const extracted = result.items[0] as ExtractedItemData;
          if (extracted.name && !form.getValues("name")) form.setValue("name", extracted.name, { shouldValidate: true });
          if (extracted.description && !form.getValues("description")) form.setValue("description", extracted.description, { shouldValidate: true });
          if (extracted.quantity && form.getValues("quantity") === 0) form.setValue("quantity", extracted.quantity, { shouldValidate: true });
          if (extracted.price && !form.getValues("originalPrice")) form.setValue("originalPrice", extracted.price, { shouldValidate: true });
          if (extracted.sku && !form.getValues("sku")) form.setValue("sku", extracted.sku, { shouldValidate: true });
          form.setValue("receiptImageUrl", base64data, { shouldValidate: true });
          toast({ title: "Receipt Processed", description: "Item details populated from receipt." });
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to process receipt.", variant: "destructive" });
      } finally {
        setIsReceiptProcessing(false);
      }
    };
    reader.onerror = () => {
        toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
        setIsReceiptProcessing(false);
    }
  };

  const handleProductImageUpload = async (file: File) => {
    setIsProductImageProcessing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      form.setValue("productImageUrl", base64data, { shouldValidate: true });
      toast({ title: "Product Image Selected", description: "Preview updated below." });
      setIsProductImageProcessing(false);
    };
    reader.onerror = () => {
      toast({ title: "Error", description: "Failed to read product image file.", variant: "destructive" });
      setIsProductImageProcessing(false);
    };
  };


  async function onSubmit(data: ItemFormValues) {
    // When auth is paused, currentUser will be null. We REMOVE the client-side auth check.
    // The server action (addItem/updateItem) will handle the user ID logic (i.e., setting it to null).
    // console.log(`[ItemForm onSubmit] Attempting submission. currentUser from useAuth():`, currentUser);
    // if (!currentUser?.id) { // REMOVED for paused auth
    //   console.error(`[ItemForm onSubmit] currentUser or currentUser.id is missing. currentUser value:`, currentUser);
    //   toast({
    //     title: "Authentication Error",
    //     description: "Your session seems to have expired or is invalid. Please log in again to add/edit an item.",
    //     variant: "destructive",
    //   });
    //   return; 
    // }

    const payload: ItemInput = {
        ...data,
        originalPrice: data.originalPrice === "" || data.originalPrice === null || data.originalPrice === undefined ? undefined : Number(data.originalPrice),
        salesPrice: data.salesPrice === "" || data.salesPrice === null || data.salesPrice === undefined ? undefined : Number(data.salesPrice),
        msrp: data.msrp === "" || data.msrp === null || data.msrp === undefined ? undefined : Number(data.msrp),
        sku: data.sku || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
        subcategory: data.subcategory || undefined,
        storageLocation: data.storageLocation || undefined,
        binLocation: data.binLocation || undefined,
        room: data.room || undefined,
        vendor: data.vendor || undefined,
        project: data.project || undefined,
        status: data.status,
        receiptImageUrl: data.receiptImageUrl || undefined,
        productImageUrl: data.productImageUrl || undefined,
        productUrl: data.productUrl || undefined,
        purchaseDate: data.purchaseDate ? data.purchaseDate.toISOString() : undefined,
        soldDate: data.soldDate ? data.soldDate.toISOString() : undefined,
        inUseDate: data.inUseDate ? data.inUseDate.toISOString() : undefined,
        invokedByUserId: currentUser?.id || undefined, // Pass current user's ID if available, else undefined. Server action will handle.
    };

    startTransition(async () => {
      try {
        const result = await onSubmitAction(payload);
        if (result && !('error' in result) && result.id) {
          toast({
            title: isEditing ? "Item Updated" : "Item Added",
            description: `${data.name} has been successfully ${isEditing ? 'updated' : 'added'}.`,
          });
          router.push('/inventory');
          router.refresh(); 
        } else {
          const errorMsg = (result as any)?.error || `Failed to ${isEditing ? 'update' : 'add'} item. Please check your input or database constraints.`;
          toast({ title: "Operation Failed", description: errorMsg, variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Submission Error", description: `An unexpected error occurred: ${(error as Error).message}. Please try again.`, variant: "destructive" });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>Provide the main information for the inventory item.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name*</FormLabel>
                      <FormControl><Input placeholder="e.g., Wireless Mouse" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Ergonomic, 2.4GHz, Black" {...field} rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                          <FormControl><Input placeholder="e.g., WM-BLK-001" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity*</FormLabel>
                          <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {availableCategories.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a subcategory" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {availableSubcategories.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="productUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product URL</FormLabel>
                      <FormControl><Input placeholder="https://example.com/product-page" {...field} /></FormControl>
                      <FormDescription>Optional link to the product's official or sales page.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Status*</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                        >
                          {itemStatuses.map((statusVal) => (
                            <FormItem key={statusVal} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={statusVal} />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {statusVal}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Purchase Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Purchase Price (Cost)</FormLabel>
                        <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field}  /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="salesPrice"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sales Price</FormLabel>
                        <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="msrp"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>MSRP</FormLabel>
                        <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="purchaseDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Purchase Date</FormLabel>
                            <DatePicker value={field.value} onChange={field.onChange} placeholder="Select purchase date" />
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="vendor"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Vendor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a vendor" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {availableVendors.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {form.watch("status") === 'sold' && (
                    <FormField
                        control={form.control}
                        name="soldDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Sold Date</FormLabel>
                            <DatePicker value={field.value} onChange={field.onChange} placeholder="Select sold date"/>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 {form.watch("status") === 'in use' && (
                    <FormField
                        control={form.control}
                        name="inUseDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>In Use Date</FormLabel>
                            <DatePicker value={field.value} onChange={field.onChange} placeholder="Select in use date"/>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Association</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="storageLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Location</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select storage location" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {availableStorageLocations.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="binLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bin Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select bin location" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {availableBinLocations.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="room"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a room" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {availableRooms.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {availableProjects.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Image</CardTitle>
                    <CardDescription>Upload an image for the product (max {MAX_IMAGE_SIZE_MB}MB).</CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUploadInput
                        onFileSelect={handleProductImageUpload}
                        disabled={isProductImageProcessing}
                        buttonText={isProductImageProcessing ? "Processing..." : "Upload Product Image"}
                        buttonIcon={isProductImageProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                        acceptedFileTypes="image/jpeg, image/png, image/gif, image/webp"
                        maxFileSizeMB={MAX_IMAGE_SIZE_MB}
                    />
                    {form.watch("productImageUrl") && (
                    <div className="mt-4">
                        <FormLabel>Product Image Preview</FormLabel>
                        <NextImage src={form.watch("productImageUrl")!} alt="Product Preview" width={200} height={200} className="mt-2 rounded-md border max-h-60 w-full object-contain" data-ai-hint="product item" />
                    </div>
                    )}
                    <FormField control={form.control} name="productImageUrl" render={({ field }) => ( <FormItem className="hidden"><FormControl><Input {...field} /></FormControl></FormItem>)} />
                </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Receipt Upload</CardTitle>
                <CardDescription>Upload a receipt image to auto-fill details (max {MAX_IMAGE_SIZE_MB}MB).</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadInput
                  onFileSelect={handleReceiptUpload}
                  disabled={isReceiptProcessing}
                  buttonText={isReceiptProcessing ? "Processing..." : "Upload Receipt"}
                  buttonIcon={isReceiptProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  acceptedFileTypes="image/jpeg, image/png, image/gif, image/webp"
                  maxFileSizeMB={MAX_IMAGE_SIZE_MB}
                />
                {form.watch("receiptImageUrl") && (
                  <div className="mt-4">
                    <FormLabel>Receipt Preview</FormLabel>
                    <NextImage src={form.watch("receiptImageUrl")!} alt="Receipt Preview" width={200} height={200} className="mt-2 rounded-md border max-h-60 w-full object-contain" data-ai-hint="receipt paper" />
                  </div>
                )}
                 <FormField control={form.control} name="receiptImageUrl" render={({ field }) => ( <FormItem className="hidden"><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending || isReceiptProcessing || isProductImageProcessing}>
            Cancel
            </Button>
            <SubmitButton isPending={isPending || isReceiptProcessing || isProductImageProcessing}>
            {isEditing ? "Save Changes" : "Add Item"}
            </SubmitButton>
        </div>
      </form>
    </Form>
  );
}
