
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
import { Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { SubmitButton } from "@/components/shared/SubmitButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

const itemFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  description: z.string().max(500).optional().default(""),
  quantity: z.coerce.number().min(0, { message: "Quantity must be non-negative." }),
  category: z.string().max(50).optional().default(""),
  storageLocation: z.string().max(100).optional().default(""),
  binLocation: z.string().max(50).optional().default(""),
  vendor: z.string().max(100).optional().default(""),
  originalPrice: z.coerce.number().min(0).optional(),
  salesPrice: z.coerce.number().min(0).optional(),
  project: z.string().max(100).optional().default(""),
  receiptImageUrl: z.string().url({ message: "Please enter a valid URL for the receipt." }).optional().or(z.literal("")).default(""),
  productImageUrl: z.string().url({ message: "Please enter a valid URL for the product image." }).optional().or(z.literal("")).default(""),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  item?: Item;
  onSubmitAction: (data: ItemInput) => Promise<Item | { error: string } | undefined>;
  isEditing?: boolean;
  availableCategories: string[];
}

// Hardcoded options for now, can be made dynamic later
const storageLocationOptions = ['Warehouse A', 'Warehouse B', 'Office Shelf', 'Storage Closet', 'Remote Site', 'Main Stockroom', 'Showroom'];
const binLocationOptions = ['A-01', 'A-02', 'B-01', 'C-01', 'Shelf 1-A', 'Shelf 1-B', 'Drawer X', 'Pallet 5'];

export default function ItemForm({ item, onSubmitAction, isEditing = false, availableCategories }: ItemFormProps) {
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
      originalPrice: item?.originalPrice ?? "",
      salesPrice: item?.salesPrice ?? "",
      project: item?.project || "",
      receiptImageUrl: item?.receiptImageUrl || "",
      productImageUrl: item?.productImageUrl || "",
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
    const payload: ItemInput = {
        ...data,
        originalPrice: data.originalPrice === "" ? undefined : Number(data.originalPrice),
        salesPrice: data.salesPrice === "" ? undefined : Number(data.salesPrice),
        description: data.description || undefined,
        category: data.category || undefined,
        storageLocation: data.storageLocation || undefined,
        binLocation: data.binLocation || undefined,
        vendor: data.vendor || undefined,
        project: data.project || undefined,
        receiptImageUrl: data.receiptImageUrl || undefined,
        productImageUrl: data.productImageUrl || undefined,
    };

    startTransition(async () => {
      try {
        const result = await onSubmitAction(payload);
        if (result && !('error' in result) && result.id) {
          toast({
            title: isEditing ? "Item Updated" : "Item Added",
            description: `${data.name} has been successfully ${isEditing ? 'updated' : 'added'}.`,
          });
          if (isEditing) {
            router.push(`/inventory/${result.id}`);
          } else {
             router.push('/inventory');
          }
          router.refresh();
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableCategories.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a storage location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {storageLocationOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
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
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a bin location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {binLocationOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
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
                    <CardTitle>Product Image</CardTitle>
                    <CardDescription>Enter the URL for the product image.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                    control={form.control}
                    name="productImageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product Image URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/image.png" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    {form.watch("productImageUrl") && (
                    <div className="mt-4">
                        <FormLabel>Product Image Preview</FormLabel>
                        <Image
                            src={form.watch("productImageUrl")!}
                            alt="Product Preview"
                            width={200}
                            height={200}
                            className="mt-2 rounded-md border max-h-60 w-full object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                toast({variant: "destructive", title: "Image Load Error", description: "Could not load product image preview."});
                            }}
                            onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'block';
                            }}
                            data-ai-hint="product item"
                        />
                    </div>
                    )}
                </CardContent>
            </Card>
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
                    <Image 
                        src={form.watch("receiptImageUrl")!} 
                        alt="Receipt Preview"
                        width={200}
                        height={200}
                        className="mt-2 rounded-md border max-h-60 w-full object-contain" 
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            toast({variant: "destructive", title: "Image Load Error", description: "Could not load receipt image preview."});
                        }}
                        onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'block';
                        }}
                        data-ai-hint="receipt paper"
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
