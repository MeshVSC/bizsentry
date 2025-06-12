import Link from 'next/link';
import { PlusCircle, Upload } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { getItems, getUniqueCategories } from '@/lib/actions/itemActions';
import { getAppSettings } from '@/lib/actions/settingsActions';
import InventoryListTable from '@/components/inventory/InventoryListTable';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import PaginationControls from '@/components/inventory/PaginationControls';
import NewSidebar from '@/components/ui/NewSidebar';

export default async function InventoryPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const nameFilter = typeof searchParams.name === "string" ? searchParams.name : "";
  const categoryFilter = typeof searchParams.category === "string" ? searchParams.category : "";
  const currentPage = parseInt(typeof searchParams.page === "string" ? searchParams.page : "1", 10);

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
    <div className="flex">
      <NewSidebar>
        <Link href="/dashboard" className="block p-2 hover:bg-gray-700">Dashboard</Link>
        <Link href="/inventory" className="block p-2 hover:bg-gray-700">Inventory</Link>
      </NewSidebar>
      <main className="flex-1 p-4">
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
        <div className="flex-1 p-4">
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
        </div>
      </main>
    </div>
  );
}
