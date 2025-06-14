"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import Link from 'next/link';
import InventorySearch from './InventorySearch';
import type { Item } from '@/types/item';

interface SearchableInventoryListProps {
  items: Item[];
}

export default function SearchableInventoryList({ items }: SearchableInventoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.vendor?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-8 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No Inventory Items</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            You haven't added any items yet. Get started by adding your first item to begin managing your inventory.
          </p>
          <Button asChild className="mt-6">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <InventorySearch onSearch={setSearchQuery} />
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} of {items.length} items
          </p>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            No items match your search for "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
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
      )}
    </div>
  );
}