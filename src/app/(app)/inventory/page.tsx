
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { getItems } from '@/lib/actions/itemActions';
import InventoryListTable from '@/components/inventory/InventoryListTable';

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
      <InventoryListTable items={items} />
    </>
  );
}

    