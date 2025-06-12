
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChangeEvent, ReactNode } from "react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadInputProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string; // e.g., "image/*,.pdf"
  buttonText?: string;
  buttonIcon?: ReactNode;
  disabled?: boolean;
  maxFileSizeMB?: number; // Maximum file size in Megabytes
}

export default function FileUploadInput({
  onFileSelect,
  acceptedFileTypes = "image/*",
  buttonText = "Upload File",
  buttonIcon,
  disabled = false,
  maxFileSizeMB = 2, // Default max file size: 2MB
}: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // File size validation
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `The selected file exceeds the ${maxFileSizeMB}MB size limit. Please choose a smaller file.`,
          variant: "destructive",
        });
        // Reset file input
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      // Type validation (basic, browser usually handles this with 'accept' attribute)
      // For more robust client-side type checking, you could split acceptedFileTypes and check file.type
      // Example: if (!acceptedFileTypes.split(',').map(t => t.trim()).includes(file.type)) { ... }

      onFileSelect(file);
      // Reset file input to allow uploading the same file again if needed
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <Input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
        disabled={disabled}
      />
      <Button type="button" onClick={handleButtonClick} disabled={disabled} className="w-full">
        {buttonIcon}
        {buttonText}
      </Button>
    </div>
  );
}
