import { Suspense } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getItems } from '@/lib/actions/itemActions';
import InventoryLoadingSkeleton from '@/components/inventory/InventoryLoadingSkeleton';
import SearchableInventoryList from '@/components/inventory/SearchableInventoryList';

async function InventoryList() {
  const { items } = await getItems();
  return <SearchableInventoryList items={items} />;
}

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        title="Inventory"
        description="Manage your inventory items"
        actions={
          <Button asChild>
            <Link href="/inventory/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<InventoryLoadingSkeleton />}>
        <InventoryList />
      </Suspense>
    </>
  );
}