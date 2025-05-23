
import Link from 'next/link';
import { PlusCircle, Eye, FilePenLine, Trash2 } from 'lucide-react';
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
import { getItems, deleteItem } from '@/lib/actions/itemActions';
import type { Item } from '@/types/item';
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

async function DeleteItemAction({ itemId }: { itemId: string }) {
  const deleteItemWithId = deleteItem.bind(null, itemId);
  return (
    <form action={deleteItemWithId}>
      <SubmitButton variant="destructive" size="sm">Delete</SubmitButton>
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
          <Button asChild>
            <Link href="/inventory/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Link>
          </Button>
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
                  <ToggleSoldStatusForm item={item} /> {/* Use the new client component */}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label="View Item">
                      <Link href={`/inventory/${item.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" aria-label="Edit Item">
                      <Link href={`/inventory/${item.id}/edit`}>
                        <FilePenLine className="h-4 w-4" />
                      </Link>
                    </Button>
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
