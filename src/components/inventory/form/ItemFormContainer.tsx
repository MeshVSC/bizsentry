"use client";

import type { Item, ItemInput, ExtractedItemData } from "@/types/item";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { processReceiptImage } from "@/lib/actions/itemActions";
import { useToast } from "@/hooks/use-toast";

// Import the new components
import BasicDetailsSection from "./BasicDetailsSection";
import PricingSection from "./PricingSection";
import LocationSection from "./LocationSection";
import MediaSection from "./MediaSection";
import ActionsSidebar from "./ActionsSidebar";

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
  originalPrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().min(0).optional()
  ),
  salesPrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().min(0).optional()
  ),
  msrp: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().min(0).optional()
  ),
  sku: z.string().max(50).optional().default(""),
  status: z.enum(['in stock', 'in use', 'sold'] as const, { required_error: "Status is required."}).default("in stock"),
  receiptImageUrl: z.string().optional().or(z.literal("")).default(""),
  productImageUrl: z.string().optional().default(""),
  productUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")).default(""),
  purchaseDate: z.date().optional(),
  soldDate: z.date().optional(),
  inUseDate: z.date().optional(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormContainerProps {
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

export default function ItemFormContainer({
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
}: ItemFormContainerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isReceiptProcessing, setIsReceiptProcessing] = useState(false);
  const [isProductImageProcessing, setIsProductImageProcessing] = useState(false);

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
      originalPrice: item?.originalPrice ?? undefined, 
      salesPrice: item?.salesPrice ?? undefined,   
      msrp: item?.msrp ?? undefined,               
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
          const errorMsg = 'error' in result ? result.error : "Could not extract data from receipt.";
          toast({ title: "Receipt Processing Failed", description: errorMsg, variant: "destructive" });
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
          console.error('Failed to process receipt:', error);
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
    const payload: ItemInput = {
        ...data,
        originalPrice: data.originalPrice ?? undefined,
        salesPrice: data.salesPrice ?? undefined,
        msrp: data.msrp ?? undefined,
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
          const errorMsg = result && 'error' in result
            ? result.error
            : `Failed to ${isEditing ? 'update' : 'add'} item. Please check your input or database constraints.`;
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
            <BasicDetailsSection
              control={form.control}
              availableCategories={availableCategories}
              availableSubcategories={availableSubcategories}
            />
            
            <PricingSection
              control={form.control}
              availableVendors={availableVendors}
              watchStatus={form.watch("status")}
            />
            
            <LocationSection
              control={form.control}
              availableStorageLocations={availableStorageLocations}
              availableBinLocations={availableBinLocations}
              availableRooms={availableRooms}
              availableProjects={availableProjects}
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <MediaSection
              control={form.control}
              isReceiptProcessing={isReceiptProcessing}
              isProductImageProcessing={isProductImageProcessing}
              handleReceiptUpload={handleReceiptUpload}
              handleProductImageUpload={handleProductImageUpload}
              watchReceiptImageUrl={form.watch("receiptImageUrl")}
              watchProductImageUrl={form.watch("productImageUrl")}
              maxImageSizeMB={MAX_IMAGE_SIZE_MB}
            />
            
            <ActionsSidebar
              isEditing={isEditing}
              isPending={isPending}
              isReceiptProcessing={isReceiptProcessing}
              isProductImageProcessing={isProductImageProcessing}
            />
          </div>
        </div>

        {/* Buttons moved to sidebar - keeping this div for spacing */}
        <div className="pb-6"></div>
      </form>
    </Form>
  );
}