
"use client";

import type { Item, ItemStatus } from '@/types/item';
import { useState, useEffect, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { Eye, FilePenLine, Trash2, MoreHorizontal, PackagePlus, PackageCheck, PackageX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { bulkDeleteItems, bulkUpdateItemStatus, deleteItem as individualDeleteItem, updateItemStatus } from '@/lib/actions/itemActions';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'; 

const itemStatuses: ItemStatus[] = ['in stock', 'in use', 'sold'];

interface InventoryListTableProps {
  items: Item[];
}

function UpdateItemStatusControl({ item }: { item: Item }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState(item.status);

  useEffect(() => {
    setCurrentStatus(item.status);
  }, [item.status]);

  const handleStatusChange = (newStatus: ItemStatus) => {
    if (newStatus === currentStatus) return;
    
    startTransition(async () => {
      const result = await updateItemStatus(item.id, newStatus);
      if (result) {
        setCurrentStatus(result.status);
        toast({
          title: "Status Updated",
          description: `Item "${result.name}" status changed to ${result.status}.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update item status.",
          variant: "destructive",
        });
        setCurrentStatus(item.status); 
      }
    });
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className="w-[120px] h-8 text-xs capitalize">
        <SelectValue placeholder="Set status" />
      </SelectTrigger>
      <SelectContent>
        {itemStatuses.map(statusVal => (
          <SelectItem key={statusVal} value={statusVal} className="capitalize text-xs">
            {statusVal}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


export default function InventoryListTable({ items }: InventoryListTableProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const [isPendingBulkAction, startTransitionBulkAction] = useTransition();

  useEffect(() => { setIsMounted(true); }, []);

  const allItemIds = useMemo(() => items.map(item => item.id), [items]);
  const isAllSelected = useMemo(() => items.length > 0 && selectedItemIds.length === items.length && selectedItemIds.every(id => allItemIds.includes(id)), [selectedItemIds, items.length, allItemIds]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    setSelectedItemIds(checked === true ? items.map(item => item.id) : []);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItemIds(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
  };

  const handleBulkDelete = async () => {
    if (selectedItemIds.length === 0) return;
    startTransitionBulkAction(async () => {
      try {
        const result = await bulkDeleteItems(selectedItemIds);
        toast({ title: result.success ? "Success" : "Error", description: result.message || (result.success ? `${selectedItemIds.length} item(s) deleted.` : "Failed to delete items."), variant: result.success ? "default" : "destructive" });
        if (result.success) setSelectedItemIds([]);
      } catch {
        toast({ title: "Error", description: "Bulk delete failed.", variant: "destructive" });
      }
    });
  };

  const handleBulkUpdateStatus = async (newStatus: ItemStatus) => {
    if (selectedItemIds.length === 0) return;
    startTransitionBulkAction(async () => {
      try {
        const result = await bulkUpdateItemStatus(selectedItemIds, newStatus);
        toast({ title: result.success ? "Success" : "Error", description: result.message || (result.success ? `${selectedItemIds.length} item(s) status updated.` : "Failed to update statuses."), variant: result.success ? "default" : "destructive" });
        if (result.success) setSelectedItemIds([]);
      } catch {
        toast({ title: "Error", description: "Bulk status update failed.", variant: "destructive" });
      }
    });
  };

  if (!isMounted) {
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
          <TableBody>{[...Array(3)].map((_, i) => (<TableRow key={`skeleton-${i}`}><TableCell><Checkbox disabled /></TableCell><TableCell>Loading...</TableCell><TableCell className="hidden md:table-cell">Loading...</TableCell><TableCell className="text-right">...</TableCell><TableCell className="text-right hidden sm:table-cell">...</TableCell><TableCell className="text-center">Loading...</TableCell><TableCell className="text-right">...</TableCell></TableRow>))}</TableBody>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isPendingBulkAction}>
                  {isPendingBulkAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Set Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  {itemStatuses.map(status => (
                    <DropdownMenuItem key={status} onClick={() => handleBulkUpdateStatus(status)} className="capitalize">
                       {status === 'in stock' && <PackagePlus className="mr-2 h-4 w-4" />}
                       {status === 'in use' && <PackageCheck className="mr-2 h-4 w-4" />}
                       {status === 'sold' && <PackageX className="mr-2 h-4 w-4" />}
                      Set as {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={isPendingBulkAction}>Delete Selected</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedItemIds.length} selected item(s).</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><Button variant="destructive" onClick={handleBulkDelete} disabled={isPendingBulkAction}>{isPendingBulkAction ? 'Deleting...' : 'Confirm Delete'}</Button></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"><Checkbox checked={isAllSelected ? true : (selectedItemIds.length > 0 ? 'indeterminate' : false)} onCheckedChange={handleSelectAll} aria-label="Select all items" /></TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Sales Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No items in inventory.</TableCell></TableRow>)}
            {items.map((item) => (
              <TableRow key={item.id} data-state={selectedItemIds.includes(item.id) ? "selected" : ""}>
                <TableCell><Checkbox checked={selectedItemIds.includes(item.id)} onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)} aria-label={`Select item ${item.name}`} /></TableCell>
                <TableCell className="font-medium">
                  <Link href={`/inventory/${item.id}`} className="hover:underline text-primary">{item.name}</Link>
                  <div className="text-xs text-muted-foreground md:hidden">{item.category || '-'}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{item.category || '-'}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right hidden sm:table-cell">{item.salesPrice ? `$${item.salesPrice.toFixed(2)}` : '-'}</TableCell>
                <TableCell className="text-center"><UpdateItemStatusControl item={item} /></TableCell>
                <TableCell className="text-right"><IndividualItemActions item={item} /></TableCell>
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
        toast({ title: result ? "Success" : "Error", description: result ? `Item "${item.name}" deleted.` : "Failed to delete item.", variant: result ? "default" : "destructive" });
      } catch {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="More actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild><Link href={`/inventory/${item.id}`} className="flex items-center w-full cursor-pointer"><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href={`/inventory/${item.id}/edit`} className="flex items-center w-full cursor-pointer"><FilePenLine className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive w-full flex items-center cursor-pointer" disabled={isPending}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>{`This will permanently delete \"${item.name}\".`}</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><Button variant="destructive" onClick={handleDelete} disabled={isPending}>{isPending ? "Deleting..." : "Delete"}</Button></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    