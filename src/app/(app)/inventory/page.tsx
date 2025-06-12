
import Link from 'next/link';
import { PlusCircle, Upload } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { getItems, getUniqueCategories } from '@/lib/actions/itemActions';
import { getAppSettings } from '@/lib/actions/settingsActions';
import InventoryListTable from '@/components/inventory/InventoryListTable';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import PaginationControls from '@/components/inventory/PaginationControls';

export default async function InventoryPage({ searchParams }: { searchParams: URLSearchParams }) {
  const params = await searchParams;
  const nameFilter = params.get("name") ?? "";
  const categoryFilter = params.get("category") ?? "";
  const currentPage = parseInt(params.get("page") ?? "1", 10);

  const appSettings = await getAppSettings();
  const itemsPerPage = appSettings.defaultItemsPerPage || 5; 

  const { items, totalPages, count } = await getItems({ 
    name: nameFilter, 
    category: categoryFilter,
    page: currentPage,
    limit: itemsPerPage,
  });
  const uniqueCategories = await getUniqueCategories();

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Manage your stock items."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/inventory/bulk-import">
                <Upload className="mr-2 h-4 w-4" /> Bulk Import
              </Link>
            </Button>
            <Button asChild>
              <Link href="/inventory/add">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Link>
            </Button>
          </div>
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
            itemsPerPage={itemsPerPage}
          />
      )}
    </>
  );
}
