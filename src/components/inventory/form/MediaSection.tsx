"use client";

import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import FileUploadInput from "@/components/shared/FileUploadInput";
import NextImage from "next/image";
import { Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";

interface MediaSectionProps {
  control: Control;
  isReceiptProcessing: boolean;
  isProductImageProcessing: boolean;
  handleReceiptUpload: (file: File) => Promise<void>;
  handleProductImageUpload: (file: File) => Promise<void>;
  watchReceiptImageUrl: string;
  watchProductImageUrl: string;
  maxImageSizeMB: number;
}

export default function MediaSection({
  control,
  isReceiptProcessing,
  isProductImageProcessing,
  handleReceiptUpload,
  handleProductImageUpload,
  watchReceiptImageUrl,
  watchProductImageUrl,
  maxImageSizeMB,
}: MediaSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Image</CardTitle>
          <CardDescription>Upload an image for the product (max {maxImageSizeMB}MB).</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadInput
            onFileSelect={handleProductImageUpload}
            disabled={isProductImageProcessing}
            buttonText={isProductImageProcessing ? "Processing..." : "Upload Product Image"}
            buttonIcon={isProductImageProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
            acceptedFileTypes="image/jpeg, image/png, image/gif, image/webp"
            maxFileSizeMB={maxImageSizeMB}
          />
          {watchProductImageUrl && (
            <div className="mt-4">
              <FormLabel>Product Image Preview</FormLabel>
              <NextImage 
                src={watchProductImageUrl} 
                alt="Product Preview" 
                width={200} 
                height={200} 
                className="mt-2 rounded-md border max-h-60 w-full object-contain" 
                data-ai-hint="product item"
              />
            </div>
          )}
          <FormField 
            control={control} 
            name="productImageUrl" 
            render={({ field }) => ( 
              <FormItem className="hidden">
                <FormControl><Input {...field} /></FormControl>
              </FormItem>
            )} 
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Receipt Upload</CardTitle>
          <CardDescription>Upload a receipt image to auto-fill details (max {maxImageSizeMB}MB).</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadInput
            onFileSelect={handleReceiptUpload}
            disabled={isReceiptProcessing}
            buttonText={isReceiptProcessing ? "Processing..." : "Upload Receipt"}
            buttonIcon={isReceiptProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            acceptedFileTypes="image/jpeg, image/png, image/gif, image/webp"
            maxFileSizeMB={maxImageSizeMB}
          />
          {watchReceiptImageUrl && (
            <div className="mt-4">
              <FormLabel>Receipt Preview</FormLabel>
              <NextImage 
                src={watchReceiptImageUrl} 
                alt="Receipt Preview" 
                width={200} 
                height={200} 
                className="mt-2 rounded-md border max-h-60 w-full object-contain" 
                data-ai-hint="receipt paper"
              />
            </div>
          )}
          <FormField 
            control={control} 
            name="receiptImageUrl" 
            render={({ field }) => ( 
              <FormItem className="hidden">
                <FormControl><Input {...field} /></FormControl>
              </FormItem>
            )} 
          />
        </CardContent>
      </Card>
    </div>
  );
}