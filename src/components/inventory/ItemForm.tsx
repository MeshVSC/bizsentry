
"use client";

import type { Item, ItemInput, ExtractedItemData } from "@/types/item";
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
import { useState, useTransition } from "react";
import { processReceiptImage } from "@/lib/actions/itemActions";
import FileUploadInput from "@/components/shared/FileUploadInput";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud } from "lucide-react";
import { SubmitButton } from "@/components/shared/SubmitButton";

const itemFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  description: z.string().max(500).optional().default(""), // Ensure default for optional strings
  quantity: z.coerce.number().min(0, { message: "Quantity must be non-negative." }),
  category: z.string().max(50).optional().default(""),
  storageLocation: z.string().max(100).optional().default(""),
  binLocation: z.string().max(50).optional().default(""),
  vendor: z.string().max(100).optional().default(""),
  originalPrice: z.coerce.number().min(0).optional(), // Zod handles empty string to 0 or undefined if truly optional
  salesPrice: z.coerce.number().min(0).optional(),
  project: z.string().max(100).optional().default(""),
  receiptImageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")).default(""), // Allow empty string or valid URL
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  item?: Item; // Item is the full DB model
  onSubmitAction: (data: ItemInput) => Promise<Item | undefined | { error: string }>;
  isEditing?: boolean;
}

export default function ItemForm({ item, onSubmitAction, isEditing = false }: ItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isReceiptProcessing, setIsReceiptProcessing] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      quantity: item?.quantity || 0,
      category: item?.category || "",
      storageLocation: item?.storageLocation || "",
      binLocation: item?.binLocation || "",
      vendor: item?.vendor || "",
      originalPrice: item?.originalPrice ?? undefined, // Explicitly undefined for optional numbers if not present
      salesPrice: item?.salesPrice ?? undefined,    
      project: item?.project || "",
      receiptImageUrl: item?.receiptImageUrl || "",
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
          if (extracted.name) form.setValue("name", extracted.name, { shouldValidate: true });
          if (extracted.description) form.setValue("description", extracted.description, { shouldValidate: true });
          if (extracted.quantity) form.setValue("quantity", extracted.quantity, { shouldValidate: true });
          if (extracted.price) form.setValue("originalPrice", extracted.price, { shouldValidate: true });
          
          // For demo, using a placeholder for the uploaded image URL.
          // In a real app, this would be an actual URL from a storage service.
          // For now, storing the object URL to show a preview.
          const objectURL = URL.createObjectURL(file);
          form.setValue("receiptImageUrl", objectURL, { shouldValidate: true }); 
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

  async function onSubmit(data: ItemFormValues) {
    // Clean up optional fields: Zod default("") might send empty strings; convert to undefined for backend if preferred
    // However, ItemInput now expects string for these, so empty string is fine.
    // For optional numbers, Zod already coerces empty inputs to 0 or handles undefined based on schema.
    // originalPrice and salesPrice will be number | undefined from Zod.

    // Ensure receiptImageUrl is undefined if it's an empty string and not a valid URL
    // The schema `optional().or(z.literal("")).default("")` handles this. Zod will pass "" if empty.
    // The ItemInput type expects string | undefined for receiptImageUrl.
    const payload: ItemInput = {
        ...data,
        description: data.description || undefined, // Ensure undefined if empty
        category: data.category || undefined,
        storageLocation: data.storageLocation || undefined,
        binLocation: data.binLocation || undefined,
        vendor: data.vendor || undefined,
        project: data.project || undefined,
        receiptImageUrl: data.receiptImageUrl || undefined, // Ensure undefined if empty string
    };


    startTransition(async () => {
      try {
        const result = await onSubmitAction(payload); 
        if (result && !('error' in result) && result.id) { // Check for result.id for successful add/update
          toast({
            title: isEditing ? "Item Updated" : "Item Added",
            description: `${data.name} has been successfully ${isEditing ? 'updated' : 'added'}.`,
          });
          router.push(`/inventory/${result.id}`);
          router.refresh(); // Ensure page reloads with fresh data
        } else {
          const errorMsg = (result as any)?.error || `Failed to ${isEditing ? 'update' : 'add'} item. Please check your input.`;
          toast({
            title: "Operation Failed",
            description: errorMsg,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to submit item form:", error);
        toast({
          title: "Submission Error",
          description: `An unexpected error occurred: ${(error as Error).message}. Please try again.`,
          variant: "destructive",
        });
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
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity*</FormLabel>
                          <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl><Input placeholder="e.g., Electronics" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Vendor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => ( // field.value will be number | undefined due to zod schema
                        <FormItem>
                        <FormLabel>Original Price (Cost)</FormLabel>
                        <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="salesPrice"
                    render={({ field }) => ( // field.value will be number | undefined
                        <FormItem>
                        <FormLabel>Sales Price</FormLabel>
                        <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <FormControl><Input placeholder="e.g., Supplier Inc." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="storageLocation"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Storage Location</FormLabel>
                        <FormControl><Input placeholder="e.g., Warehouse A, Shelf 3" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="e.g., A-01-03" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="e.g., Q4 Retail Stock" {...field} /></FormControl>
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
                <CardTitle>Receipt Upload</CardTitle>
                <CardDescription>Upload a receipt image to auto-fill details.</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadInput
                  onFileSelect={handleReceiptUpload}
                  disabled={isReceiptProcessing}
                  buttonText={isReceiptProcessing ? "Processing..." : "Upload Receipt"}
                  buttonIcon={isReceiptProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                />
                {form.watch("receiptImageUrl") && (
                  <div className="mt-4">
                    <FormLabel>Receipt Preview</FormLabel>
                    {/* Ensure valid URL for img src; object URLs are temporary */}
                    <img 
                        src={form.watch("receiptImageUrl")} 
                        alt="Receipt Preview" 
                        className="mt-2 rounded-md border max-h-60 w-full object-contain" 
                        onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails to load
                    />
                  </div>
                )}
                 <FormField
                  control={form.control}
                  name="receiptImageUrl"
                  render={({ field }) => ( <FormItem className="hidden"><FormControl><Input {...field} /></FormControl></FormItem>)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending || isReceiptProcessing}>
            Cancel
            </Button>
            <SubmitButton isPending={isPending || isReceiptProcessing}>
            {isEditing ? "Save Changes" : "Add Item"}
            </SubmitButton>
        </div>
      </form>
    </Form>
  );
}
