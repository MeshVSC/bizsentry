
import Link from 'next/link';
import { PlusCircle, Eye, FilePenLine, Trash2, Barcode, QrCode } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getItems, deleteItem, toggleItemSoldStatus } from '@/lib/actions/itemActions';
import type { Item } from '@/types/item';
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
import { SubmitButton } from '@/components/shared/SubmitButton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

async function DeleteItemAction({ itemId }: { itemId: string }) {
  const deleteItemWithId = deleteItem.bind(null, itemId);
  return (
    <form action={deleteItemWithId}>
      <SubmitButton variant="destructive" size="sm">Delete</SubmitButton>
    </form>
  );
}

async function ToggleSoldStatusAction({ item }: { item: Item }) {
  const toggleSoldStatusWithId = toggleItemSoldStatus.bind(null, item.id);
  return (
    <form action={toggleSoldStatusWithId} className="flex items-center space-x-2">
      <Switch
        id={`sold-switch-${item.id}`}
        checked={item.sold}
        onCheckedChange={(event) => {
          // This will trigger form submission on change
          const form = (event.target as HTMLElement).closest('form');
          form?.requestSubmit();
        }}
        aria-label={item.sold ? "Mark as not sold" : "Mark as sold"}
      />
      <Label htmlFor={`sold-switch-${item.id}`} className="text-xs">
        {item.sold ? "Sold" : "In Stock"}
      </Label>
    </form>
  );
}


export default async function InventoryPage() {
  const items = await getItems();

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Manage your stock items."
        actions={
          <Link href="/inventory/add" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </Link>
        }
      />
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Sales Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No items in inventory. Get started by adding one!
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
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
                  <ToggleSoldStatusAction item={item} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/inventory/${item.id}`} passHref>
                      <Button variant="ghost" size="icon" aria-label="View Item">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/inventory/${item.id}/edit`} passHref>
                      <Button variant="ghost" size="icon" aria-label="Edit Item">
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Delete Item">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the item
                            "{item.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <DeleteItemAction itemId={item.id} />
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
