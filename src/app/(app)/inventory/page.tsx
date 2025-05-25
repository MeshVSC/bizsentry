
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { getItems, getUniqueCategories } from '@/lib/actions/itemActions';
import InventoryListTable from '@/components/inventory/InventoryListTable';
import InventoryFilters from '@/components/inventory/InventoryFilters';

interface InventoryPageProps {
  searchParams?: {
    name?: string;
    category?: string;
  };
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const nameFilter = searchParams?.name || '';
  const categoryFilter = searchParams?.category || '';

  const items = await getItems({ name: nameFilter, category: categoryFilter });
  const uniqueCategories = await getUniqueCategories();

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
      <InventoryFilters
        currentNameFilter={nameFilter}
        currentCategoryFilter={categoryFilter}
        allCategories={uniqueCategories}
      />
      <InventoryListTable items={items} />
    </>
  );
}
