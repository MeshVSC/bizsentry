import { Suspense } from 'react';
import { getItems } from '@/lib/actions/itemActions';
import InventoryLoadingSkeleton from '@/components/inventory/InventoryLoadingSkeleton';
import SearchableInventoryList from '@/components/inventory/SearchableInventoryList';

async function InventoryList() {
  const { items } = await getItems();
  return <SearchableInventoryList items={items} />;
}

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<InventoryLoadingSkeleton />}>
        <InventoryList />
      </Suspense>
    </div>
  );
}