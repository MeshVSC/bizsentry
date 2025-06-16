
"use client";

import type { Item } from '@/types/item';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateItemStatus } from '@/lib/actions/itemActions';
import { useTransition, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ToggleSoldStatusFormProps {
  item: Item;
}

export default function ToggleSoldStatusForm({ item }: ToggleSoldStatusFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  // State to manage the checked status of the switch, initialized by item.status
  const [isChecked, setIsChecked] = useState(item.status === 'sold');

  // Effect to update local isChecked state if the item prop changes (e.g., after revalidation)
  useEffect(() => {
    setIsChecked(item.status === 'sold');
  }, [item.status]);

  const handleToggle = (checked: boolean) => {
    // Optimistically update the UI
    setIsChecked(checked);

    startTransition(async () => {
      const newStatus = checked ? 'sold' : 'in stock';
      const result = await updateItemStatus(item.id, newStatus);
      if (result && !('error' in result)) {
        // Server action revalidates, so item.status prop will update, triggering useEffect.
        setIsChecked(result.status === 'sold'); 
        toast({
          title: "Status Updated",
          description: `Item "${result.name}" marked as ${result.status === 'sold' ? 'Sold' : 'In Stock'}.`,
        });
      } else {
        // Revert optimistic update on failure
        setIsChecked(!checked); 
        toast({
          title: "Error",
          description: "Failed to update item status.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`sold-switch-${item.id}`}
        checked={isChecked}
        disabled={isPending}
        onCheckedChange={handleToggle}
        aria-label={isChecked ? "Mark as not sold" : "Mark as sold"}
      />
      <Label htmlFor={`sold-switch-${item.id}`} className="text-xs">
        {isChecked ? "Sold" : "In Stock"}
      </Label>
    </div>
  );
}
