
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LucideIcon } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { useRef } from "react";

interface FileUploadInputProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string; // e.g., "image/*,.pdf"
  buttonText?: string;
  buttonIcon?: ReactNode;
  disabled?: boolean;
}

export default function FileUploadInput({
  onFileSelect,
  acceptedFileTypes = "image/*",
  buttonText = "Upload File",
  buttonIcon,
  disabled = false,
}: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
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
