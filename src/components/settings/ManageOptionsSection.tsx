
"use client";

import { useState, useTransition, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from '@/components/shared/SubmitButton';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { bulkDeleteManagedOptions, type OptionType } from '@/lib/actions/itemActions';

interface ManageOptionsSectionProps {
  optionType: OptionType; 
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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isPendingAdd, startTransitionAdd] = useTransition();
  const [isPendingDelete, startTransitionDelete] = useTransition();
  const [isPendingBulkDelete, startTransitionBulkDelete] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setOptions(initialOptions);
    setSelectedOptions([]); // Clear selection when initial options change
  }, [initialOptions]);

  const isAllSelected = useMemo(() => options.length > 0 && selectedOptions.length === options.length, [options, selectedOptions]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    setSelectedOptions(checked === true ? [...options] : []);
  };

  const handleSelectOption = (optionName: string, checked: boolean) => {
    setSelectedOptions(prev => checked ? [...prev, optionName] : prev.filter(name => name !== optionName));
  };

  const handleAddOption = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newOptionName.trim()) {
      toast({ title: "Error", description: `${optionTypeToSingularName[optionType]} name cannot be empty.`, variant: "destructive" });
      return;
    }
    startTransitionAdd(async () => {
      const result = await addOptionAction(newOptionName.trim());
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setOptions(result.options || []);
        setNewOptionName("");
      } else {
        toast({ title: "Error", description: result.message || `Failed to add ${optionTypeToSingularName[optionType]}.`, variant: "destructive" });
      }
    });
  };

  const handleDeleteOption = async (optionToDelete: string) => {
    startTransitionDelete(async () => {
      const result = await deleteOptionAction(optionToDelete);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setOptions(result.options || []);
        setSelectedOptions(prev => prev.filter(name => name !== optionToDelete));
      } else {
        toast({ title: "Error", description: result.message || `Failed to delete ${optionTypeToSingularName[optionType]}.`, variant: "destructive" });
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedOptions.length === 0) return;
    startTransitionBulkDelete(async () => {
      const result = await bulkDeleteManagedOptions(selectedOptions, optionType);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setOptions(prevOptions => prevOptions.filter(opt => !selectedOptions.includes(opt)));
        setSelectedOptions([]);
      } else {
        toast({ title: "Error", description: result.message || `Failed to bulk delete ${optionTypeToSingularName[optionType]}s.`, variant: "destructive" });
      }
    });
  };
  
  // Helper to get singular name for display
  const optionTypeToSingularName: Record<OptionType, string> = {
    'category': 'Category',
    'subcategory': 'Subcategory',
    'storage_location': 'Storage Location',
    'bin_location': 'Bin Location',
    'room': 'Room',
    'vendor': 'Vendor',
    'project': 'Project',
  };
  const currentOptionSingular = optionTypeToSingularName[optionType];
  const currentOptionPlural = `${currentOptionSingular}s`;


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Add New {currentOptionSingular}</h3>
        <form onSubmit={handleAddOption} className="flex items-center gap-2">
          <Input
            type="text"
            value={newOptionName}
            onChange={(e) => setNewOptionName(e.target.value)}
            placeholder={`Enter new ${currentOptionSingular.toLowerCase()} name...`}
            className="flex-grow"
            disabled={isPendingAdd || isPendingBulkDelete}
          />
          <SubmitButton 
            isPending={isPendingAdd || isPendingBulkDelete}
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.2)'
            }}
            className="transition-all duration-300 hover:scale-105 hover:bg-[rgba(34,197,94,0.2)] hover:border-[rgba(34,197,94,0.5)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.3)]"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add {currentOptionSingular}
          </SubmitButton>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Existing {currentOptionPlural} ({options.length})</h3>
            {selectedOptions.length > 0 && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          disabled={isPendingBulkDelete}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
                          }}
                          className="transition-all duration-300 hover:scale-105 hover:bg-[rgba(239,68,68,0.2)] hover:border-[rgba(239,68,68,0.5)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)]"
                        >
                            {isPendingBulkDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Delete Selected ({selectedOptions.length})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will delete {selectedOptions.length} selected {currentOptionSingular.toLowerCase()}(s). This cannot be undone.
                          Items currently using these {currentOptionSingular.toLowerCase()}(s) will not be automatically reassigned.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPendingBulkDelete}>Cancel</AlertDialogCancel>
                        <Button variant="destructive" onClick={handleBulkDelete} disabled={isPendingBulkDelete}>
                           {isPendingBulkDelete ? "Deleting..." : `Delete ${selectedOptions.length} ${currentOptionSingular.toLowerCase()}(s)`}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
            )}
        </div>
        {options.length > 0 ? (
          <ScrollArea className="h-72 w-full rounded-md border">
            <div className="p-4 space-y-2">
              <div className="flex items-center py-2 px-2 border-b">
                <Checkbox
                  id={`select-all-${optionType}`}
                  checked={isAllSelected ? true : (selectedOptions.length > 0 ? 'indeterminate' : false)}
                  onCheckedChange={handleSelectAll}
                  aria-label={`Select all ${currentOptionPlural.toLowerCase()}`}
                  className="mr-3"
                  disabled={isPendingBulkDelete}
                />
                <label htmlFor={`select-all-${optionType}`} className="text-sm font-medium flex-grow">
                  Select All ({selectedOptions.length} / {options.length})
                </label>
              </div>
              {options.map((option) => (
                <div key={option} className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center flex-grow">
                    <Checkbox
                      id={`${optionType}-${option.replace(/\s+/g, '-')}`}
                      checked={selectedOptions.includes(option)}
                      onCheckedChange={(checked) => handleSelectOption(option, !!checked)}
                      aria-label={`Select ${currentOptionSingular.toLowerCase()} ${option}`}
                      className="mr-3"
                      disabled={isPendingBulkDelete}
                    />
                    <label 
                      htmlFor={`${optionType}-${option.replace(/\s+/g, '-')}`}
                      className="text-sm cursor-pointer flex-grow"
                    >
                      {option}
                    </label>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         disabled={isPendingDelete || isPendingBulkDelete} 
                         aria-label={`Delete ${currentOptionSingular.toLowerCase()} ${option}`}
                         className="opacity-50 hover:opacity-100"
                       >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will delete the {currentOptionSingular.toLowerCase()} &quot;{option}&quot;. This cannot be undone.
                          Items currently using this {currentOptionSingular.toLowerCase()} will not be automatically reassigned.
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
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground p-4 border rounded-md">No {currentOptionPlural.toLowerCase()} defined yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}

