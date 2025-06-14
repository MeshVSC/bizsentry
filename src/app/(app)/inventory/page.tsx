import { Suspense } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getItems } from '@/lib/actions/itemActions';

async function InventoryList() {
  const { items } = await getItems();

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-semibold">No Inventory Items</h3>
          <p className="text-muted-foreground mt-2">
            You haven't added any items yet. Get started by adding your first item.
          </p>
          <Button asChild className="mt-4">
            <Link href="/inventory/add">
              <Plus className="mr-2 h-4 w-4" />
              Add First Item
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="truncate">{item.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                Qty: {item.quantity}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'in stock' ? 'bg-green-100 text-green-800' :
                  item.status === 'in use' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/inventory/${item.id}`}>
                    View
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
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
      <Suspense fallback={<div>Loading...</div>}>
        <InventoryList />
      </Suspense>
    </>
  );
}