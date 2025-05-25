
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { getItems, getUniqueCategories } from '@/lib/actions/itemActions';
import InventoryListTable from '@/components/inventory/InventoryListTable';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import PaginationControls from '@/components/inventory/PaginationControls';

interface InventoryPageProps {
  searchParams?: {
    name?: string;
    category?: string;
    page?: string;
  };
}

const ITEMS_PER_PAGE = 5;

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const nameFilter = searchParams?.name || '';
  const categoryFilter = searchParams?.category || '';
  const currentPage = parseInt(searchParams?.page || '1', 10);

  const { items, totalPages, count } = await getItems({ 
    name: nameFilter, 
    category: categoryFilter,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
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
      {count > 0 && (
         <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={count}
            itemsPerPage={ITEMS_PER_PAGE}
          />
      )}
    </>
  );
}

```