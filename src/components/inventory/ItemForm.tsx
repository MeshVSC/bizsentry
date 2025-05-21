
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
  description: z.string().max(500).optional(),
  quantity: z.coerce.number().min(0, { message: "Quantity must be non-negative." }),
  category: z.string().max(50).optional(),
  storageLocation: z.string().max(100).optional(),
  binLocation: z.string().max(50).optional(),
  vendor: z.string().max(100).optional(),
  originalPrice: z.coerce.number().min(0).optional(),
  salesPrice: z.coerce.number().min(0).optional(),
  project: z.string().max(100).optional(),
  receiptImageUrl: z.string().url().optional(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  item?: Item;
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
      originalPrice: item?.originalPrice || undefined,
      salesPrice: item?.salesPrice || undefined,
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
          // For simplicity, using the first item extracted. A real app might allow choosing or merging.
          const extracted = result.items[0] as ExtractedItemData;
          if (extracted.name) form.setValue("name", extracted.name, { shouldValidate: true });
          if (extracted.description) form.setValue("description", extracted.description, { shouldValidate: true });
          if (extracted.quantity) form.setValue("quantity", extracted.quantity, { shouldValidate: true });
          if (extracted.price) form.setValue("originalPrice", extracted.price, { shouldValidate: true });
          // Simulate storing the image URL. In a real app, upload to storage and get URL.
          form.setValue("receiptImageUrl", URL.createObjectURL(file)); 
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
    startTransition(async () => {
      const result = await onSubmitAction(data as ItemInput); // Cast needed due to Omit in ItemInput
      if (result && !('error' in result)) {
        toast({
          title: isEditing ? "Item Updated" : "Item Added",
          description: `${data.name} has been successfully ${isEditing ? 'updated' : 'added'}.`,
        });
        router.push(`/inventory/${result.id}`);
      } else {
         const errorMsg = (result as any)?.error || `Failed to ${isEditing ? 'update' : 'add'} item.`;
        toast({
          title: "Error",
          description: errorMsg,
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
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Original Price (Cost)</FormLabel>
                        <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
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
                    <img src={form.watch("receiptImageUrl")} alt="Receipt Preview" className="mt-2 rounded-md border max-h-60 w-full object-contain" />
                  </div>
                )}
                 <FormField
                  control={form.control}
                  name="receiptImageUrl"
                  render={({ field }) => ( <FormItem className="hidden"><FormControl><Input {...field} /></FormControl></FormItem>)} // Hidden field to store URL
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

