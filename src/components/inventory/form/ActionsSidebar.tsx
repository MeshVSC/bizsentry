"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubmitButton } from "@/components/shared/SubmitButton";

interface ActionsSidebarProps {
  isEditing: boolean;
  isPending: boolean;
  isReceiptProcessing: boolean;
  isProductImageProcessing: boolean;
}

export default function ActionsSidebar({
  isEditing,
  isPending,
  isReceiptProcessing,
  isProductImageProcessing,
}: ActionsSidebarProps) {
  const router = useRouter();

  const isDisabled = isPending || isReceiptProcessing || isProductImageProcessing;

  return (
    <div className="sticky top-24 z-10">
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Save your changes or cancel editing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <SubmitButton 
              isPending={isDisabled}
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.2)'
              }}
              className="w-full transition-all duration-300 hover:scale-105 hover:bg-[rgba(34,197,94,0.2)] hover:border-[rgba(34,197,94,0.5)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.3)]"
            >
              {isEditing ? "Save Changes" : "Add Item"}
            </SubmitButton>
            <Button 
              type="button" 
              onClick={() => router.back()} 
              disabled={isDisabled}
              style={{
                background: 'rgba(255, 159, 67, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 159, 67, 0.3)',
                color: '#ff9f43',
                boxShadow: '0 4px 16px rgba(255, 159, 67, 0.2)'
              }}
              className="w-full transition-all duration-300 hover:scale-105 hover:bg-[rgba(255,159,67,0.2)] hover:border-[rgba(255,159,67,0.5)] hover:shadow-[0_6px_20px_rgba(255,159,67,0.3)]"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}