
"use client";

import { useState, useTransition, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from '@/components/shared/SubmitButton';
import { Trash2, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ManageOptionsSectionProps {
  optionType: string; // e.g., "Category", "Storage Location"
  initialOptions: string[];
  addOptionAction: (name: string) => Promise<{ success: boolean; message?: string; options?: string[] }>;
  deleteOptionAction: (name: string) => Promise<{ success: boolean; message?: string; options?: string[] }>;
}

export default function ManageOptionsSection({ 
  optionType, 
  initialOptions, 
  addOptionAction, 
  deleteOptionAction 
}: ManageOptionsSectionProps) {
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [newOptionName, setNewOptionName] = useState("");
  const [isPendingAdd, startTransitionAdd] = useTransition();
  const [isPendingDelete, startTransitionDelete] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleAddOption = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newOptionName.trim()) {
      toast({ title: "Error", description: `${optionType} name cannot be empty.`, variant: "destructive" });
      return;
    }
    startTransitionAdd(async () => {
      const result = await addOptionAction(newOptionName.trim());
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setOptions(result.options || []);
        setNewOptionName("");
      } else {
        toast({ title: "Error", description: result.message || `Failed to add ${optionType}.`, variant: "destructive" });
      }
    });
  };

  const handleDeleteOption = async (optionToDelete: string) => {
    startTransitionDelete(async () => {
      const result = await deleteOptionAction(optionToDelete);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setOptions(result.options || []);
      } else {
        toast({ title: "Error", description: result.message || `Failed to delete ${optionType}.`, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Add New {optionType}</h3>
        <form onSubmit={handleAddOption} className="flex items-center gap-2">
          <Input
            type="text"
            value={newOptionName}
            onChange={(e) => setNewOptionName(e.target.value)}
            placeholder={`Enter new ${optionType.toLowerCase()} name...`}
            className="flex-grow"
            disabled={isPendingAdd}
          />
          <SubmitButton isPending={isPendingAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add {optionType}
          </SubmitButton>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Existing {optionType}s ({options.length})</h3>
        {options.length > 0 ? (
          <ScrollArea className="h-60 w-full rounded-md border p-4">
            <ul className="space-y-2">
              {options.map((option) => (
                <li key={option} className="flex items-center justify-between p-2 bg-muted/50 rounded-md shadow-sm">
                  <span className="text-sm">{option}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon" disabled={isPendingDelete} aria-label={`Delete ${optionType} ${option}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will delete the {optionType.toLowerCase()} "{option}". This cannot be undone.
                          Items currently using this {optionType.toLowerCase()} will not be automatically reassigned.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPendingDelete}>Cancel</AlertDialogCancel>
                        <Button variant="destructive" onClick={() => handleDeleteOption(option)} disabled={isPendingDelete}>
                           {isPendingDelete ? "Deleting..." : "Delete"}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground">No {optionType.toLowerCase()}s defined yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
