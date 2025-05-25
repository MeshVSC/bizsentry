"use client";

import type { Item } from '@/types/item';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Eye, FilePenLine, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { SubmitButton } from '@/components/shared/SubmitButton';
import ToggleSoldStatusForm from '@/components/inventory/ToggleSoldStatusForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { bulkDeleteItems, bulkUpdateSoldStatus, deleteItem as individualDeleteItem } from '@/lib/actions/itemActions';
import { useTransition } from 'react';


interface InventoryListTableProps {
  items: Item[];
}

export default function InventoryListTable({ items }: InventoryListTableProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const [isPendingBulkAction, startTransitionBulkAction] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allItemIds = useMemo(() => items.map(item => item.id), [items]);

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedItemIds.length === items.length && selectedItemIds.every(id => allItemIds.includes(id));
  }, [selectedItemIds, items.length, allItemIds]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedItemIds(items.map(item => item.id));
    } else {
      setSelectedItemIds([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItemIds(prev =>
      checked ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  };

  const handleBulkDelete = async () => {
    if (selectedItemIds.length === 0) return;
    startTransitionBulkAction(async () => {
        try {
        const result = await bulkDeleteItems(selectedItemIds);
        if (result.success) {
            toast({ title: "Success", description: `${selectedItemIds.length} item(s) deleted.` });
            setSelectedItemIds([]); 
        } else {
            toast({ title: "Error", description: result.message || "Failed to delete items.", variant: "destructive" });
        }
        } catch (error) {
            toast({ title: "Error", description: "An unexpected error occurred during bulk delete.", variant: "destructive" });
        }
    });
  };

  const handleBulkUpdateStatus = async (sold: boolean) => {
    if (selectedItemIds.length === 0) return;
    startTransitionBulkAction(async () => {
        try {
        const result = await bulkUpdateSoldStatus(selectedItemIds, sold);
        if (result.success) {
            toast({ title: "Success", description: `${selectedItemIds.length} item(s) updated to ${sold ? 'Sold' : 'In Stock'}.` });
            setSelectedItemIds([]);
        } else {
            toast({ title: "Error", description: result.message || "Failed to update item statuses.", variant: "destructive" });
        }
        } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred during bulk status update.", variant: "destructive" });
        }
    });
  };


  if (!isMounted) {
    // Avoid hydration mismatch for checkboxes by rendering them only on client
    // Render a skeleton or placeholder table during server render / hydration
    return (
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"><Checkbox disabled /></TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Sales Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell><Checkbox disabled /></TableCell>
                <TableCell className="font-medium">Loading...</TableCell>
                <TableCell className="hidden md:table-cell">Loading...</TableCell>
                <TableCell className="text-right">...</TableCell>
                <TableCell className="text-right hidden sm:table-cell">...</TableCell>
                <TableCell className="text-center">Loading...</TableCell>
                <TableCell className="text-right">...</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div>
      {selectedItemIds.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-md flex flex-col sm:flex-row items-center justify-between gap-2 shadow">
          <span className="text-sm font-medium">{selectedItemIds.length} item(s) selected</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkUpdateStatus(false)} disabled={isPendingBulkAction}>Mark as In Stock</Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkUpdateStatus(true)} disabled={isPendingBulkAction}>Mark as Sold</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isPendingBulkAction}>Delete Selected</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete {selectedItemIds.length} selected item(s).
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleBulkDelete} disabled={isPendingBulkAction}>
                        {isPendingBulkAction ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected ? true : (selectedItemIds.length > 0 ? 'indeterminate' : false)}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all items"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Sales Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  No items in inventory. Get started by adding one!
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id} data-state={selectedItemIds.includes(item.id) ? "selected" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selectedItemIds.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                    aria-label={`Select item ${item.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/inventory/${item.id}`} className="hover:underline text-primary">
                    {item.name}
                  </Link>
                  <div className="text-xs text-muted-foreground md:hidden">{item.category || '-'}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{item.category || '-'}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right hidden sm:table-cell">
                  {item.salesPrice ? `$${item.salesPrice.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell className="text-center">
                  <ToggleSoldStatusForm item={item} />
                </TableCell>
                <TableCell className="text-right">
                   <IndividualItemActions item={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function IndividualItemActions({ item }: { item: Item }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const result = await individualDeleteItem(item.id);
        if (result) {
          toast({ title: "Success", description: `Item "${item.name}" deleted.` });
        } else {
          toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="More actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/inventory/${item.id}`} className="flex items-center w-full cursor-pointer">
            <Eye className="mr-2 h-4 w-4" /> View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/inventory/${item.id}/edit`} className="flex items-center w-full cursor-pointer">
            <FilePenLine className="mr-2 h-4 w-4" /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()} 
              className="text-destructive focus:bg-destructive/10 focus:text-destructive w-full flex items-center cursor-pointer"
              disabled={isPending}
            >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the item "{item.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                {isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    